import json
import os
import re
import logging
from typing import Any, Dict
import asyncio
from openai import AsyncOpenAI

from app.utils.pdf_reader import extract_text_from_pdf
from app.utils.cache_manager import get_from_cache, save_to_cache, get_hash
from app.utils.text_utils import safe_parse_json_from_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def extract_data(label: str, schema: Dict[str, Any], pdf) -> Dict[str, Any]:
    file_bytes = await pdf.read()
    cache_key = f"{label}-{get_hash(file_bytes)}-{get_hash(json.dumps(schema, ensure_ascii=False))}"

    # 🔹 Verifica cache do resultado completo
    cached = get_from_cache(cache_key)
    if cached:
        logger.info(f"[{pdf.filename}] Cache HIT para documento exato.")
        return cached

    # 🔹 Extrai o texto do pdf
    text = extract_text_from_pdf(file_bytes)

    # 🔹 Carrega cache de valores históricos para esse label
    label_history = get_from_cache(f"results_cache_{label}") or {}
    logger.info(f"[{label}] Histórico de valores: { {k: len(v) for k, v in label_history.items()} }")

    # 🔹 Padrões genéricos base (fallback)
    default_patterns = {
        "cpf": r"\d{3}\.?\d{3}\.?\d{3}-?\d{2}",
        "cnpj": r"\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}",
        "data": r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",
        "telefone": r"\(?\d{2}\)?\s?\d{4,5}-?\d{4}",
        "cep": r"\b\d{5}-?\d{3}\b",
        "valor": r"R\$?\s?\d{1,3}(?:\.\d{3})*,\d{2}",
    }

    extracted: Dict[str, Any] = {}

    # 🔹 Heurística 1: tenta usar valores históricos cacheados
    for field, _ in schema.items():
        value_found = None

        previous_values = label_history.get(field, [])
        for prev in previous_values:
            if prev and str(prev) in text:
                logger.info(f"[{pdf.filename}] Campo '{field}' identificado via cache: {prev}")
                value_found = prev
                break

        if value_found:
            extracted[field] = value_found
            continue

        # 🔹 Heurística 2: regex genérica (caso aplicável)
        pattern = next((p for k, p in default_patterns.items() if k in field.lower()), None)
        if pattern:
            m = re.search(pattern, text, flags=re.IGNORECASE)
            if m:
                extracted[field] = m.group(0).strip()
                continue

        extracted[field] = None

    # 🔹 Calcula acurácia heurística
    total = len(schema)
    filled = sum(1 for v in extracted.values() if v)
    accuracy = filled / total if total > 0 else 0
    logger.info(f"[{pdf.filename}] Acurácia heurística: {accuracy:.2%}")

    # 🔹 Se já tiver 80% de acerto, não chama LLM
    if accuracy >= 0.8:
        logger.info(f"[{pdf.filename}] Acurácia >= 80%, pulando LLM.")
        save_to_cache(cache_key, extracted)
        return extracted

    # 🔹 Campos faltantes
    missing_fields = [k for k, v in extracted.items() if v is None]
    
    if not missing_fields:
        save_to_cache(cache_key, extracted)
        return extracted

    # 🔹 Chama LLM apenas pros campos que faltam
    llm_prompt = f"""
    Extraia um objeto JSON com os campos abaixo a partir do texto fornecido.

    Campos a extrair: {missing_fields}

    Regras:
    - Retorne um JSON contendo exatamente esses campos (mesmo que alguns sejam null).
    - Se o valor não puder ser identificado, defina-o como null.
    - Não adicione explicações, comentários nem texto fora do JSON.

    Texto do documento:
    {text[:6000]}
    """

    try:
        completion = await asyncio.wait_for(
            client.responses.create(
                model="gpt-5-mini",
                input=llm_prompt,
            ),
            timeout=100,
        )
        raw_text = completion.output_text
        llm_result = safe_parse_json_from_text(raw_text) or {}

        for field in missing_fields:
            value = llm_result.get(field)
            if value is not None:
                extracted[field] = value
                # 🔹 Salva valor no histórico para heurísticas futuras
                label_history.setdefault(field, [])
                if value not in label_history[field]:
                    label_history[field].append(value)

    except Exception as e:
        logger.warning(f"[{pdf.filename}] Erro ao chamar LLM: {e}")

    # 🔹 Atualiza cache de histórico
    save_to_cache(f"results_cache_{label}", label_history)

    # 🔹 Salva cache completo do resultado
    save_to_cache(cache_key, extracted)
    return extracted
