## 🧠 Backend — Extração Estruturada de PDFs

Este repositório contém o backend da aplicação de extração de informações estruturadas a partir de arquivos PDF.
A API é construída com FastAPI e executada com Uvicorn, oferecendo um endpoint capaz de processar PDFs com schemas e labels definidos dinamicamente.

## 🚀 Tecnologias Utilizadas

Python 3.10+

FastAPI — framework web assíncrono e performático

Uvicorn — servidor ASGI leve e rápido

Pydantic — validação e tipagem de dados

python-dotenv — gerenciamento de variáveis de ambiente

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

Python 3.10 ou superior

pip (gerenciador de pacotes do Python)

Sistema operacional compatível (Linux, macOS ou Windows)

## Configuração do Ambiente
1. **Navegar até a pasta do back-end**
```bash
cd back-end
```
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
4. **Atualize o pip**
```bash
  python -m pip install --upgrade pip
```
5. **Instalar as Dependências**
```bash
pip install -r requirements.txt
```

## Variáveis de Ambiente
Crie um arquivo chamado .env na raiz do projeto backend e adicione sua chave da OpenAI:
```bash
OPENAI_API_KEY=your-openai-api-key
```


## Executando o Servidor
```bash
python -m uvicorn app.main:app --reload
```
A API estará disponível em:
👉 http://localhost:8000








