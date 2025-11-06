# Backend - Extração de PDFs

Este é o backend da aplicação de **extração estruturada de PDFs**, implementado em Python com FastAPI e Uvicorn. Ele expõe um endpoint para receber PDFs, schemas e labels, realizando a extração de dados de forma eficiente.

---

## Pré-requisitos

- Python >= 3.10
- pip
- Sistema operacional compatível (Linux, macOS, Windows)

---

## Configuração do Ambiente
1. **Navegar até a pasta do back-end**

2. **Criar um ambiente virtual**

```bash
python -m venv venv
```
3. **Ativar o ambiente virtual**

- Linux/macOS
```bash
source venv/bin/activate
```
- Windows (CMD)
```bash
venv\Scripts\activate.bat
```
- Windows (PowerShell)
```bash
venv\Scripts\Activate.ps1
```
- Linux/macOS
```bash
python -m venv venv
```
4. ** Atualize o pip**
```bash
  python -m pip install --upgrade pip
```
5. **Instalar as Dependências**
```bash
pip install -r requirements.txt
```

## Variáveis de Ambiente
- Crie um arquivo .env e configure a variável de ambiente OPENAI_API_KEY com sua chave da OpenAI no arquivo

## Executando o Servidor
```bash
python -m uvicorn app.main:app --reload
```




