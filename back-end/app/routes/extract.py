from fastapi import APIRouter, UploadFile, Form, HTTPException
from app.services.extractor import extract_data
import time
import json
import logging

# Configuração básica do logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/extract")
async def extract_endpoint(
    label: str = Form(...),
    extraction_schema: str = Form(...),
    pdf: UploadFile = Form(...)
):
    start = time.time()
    try:
        try:
            schema_dict = json.loads(extraction_schema)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="extraction_schema não é um JSON válido.")

        result = await extract_data(label, schema_dict, pdf)

        # Log da resposta usando o caminho/nome do PDF
        logger.info(f"Extração concluída para PDF='{pdf.filename}': {json.dumps(result, ensure_ascii=False)}")

    except Exception as e:
        logger.exception(f"Erro ao extrair dados para PDF='{pdf.filename}'")
        raise HTTPException(status_code=500, detail=f"Erro ao extrair dados: {str(e)}")

    elapsed = round(time.time() - start, 2)
    return {"time": elapsed, "data": result}
