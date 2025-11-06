import re
import json
from typing import Any, Dict, Optional

def safe_parse_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extrai e faz parse do primeiro JSON válido encontrado em um texto arbitrário.
    Tolera texto extra antes ou depois do JSON.
    Retorna None se não conseguir extrair.
    """
    # tenta encontrar o primeiro bloco que parece JSON
    json_candidates = re.findall(r'\{.*?\}', text, flags=re.DOTALL)
    for candidate in json_candidates:
        # tenta balancear as chaves (evita pegar apenas uma parte do JSON)
        open_braces = 0
        clean_json = ""
        for char in candidate:
            clean_json += char
            if char == "{":
                open_braces += 1
            elif char == "}":
                open_braces -= 1
                if open_braces == 0:
                    break
        try:
            return json.loads(clean_json)
        except json.JSONDecodeError:
            continue

    # fallback: tenta o texto inteiro (última tentativa)
    try:
        return json.loads(text)
    except Exception:
        return None
