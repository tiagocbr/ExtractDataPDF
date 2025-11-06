# Extração Estruturada de PDFs

## Descrição Geral

Esta solução implementa a extração de informações estruturadas de arquivos PDF de forma **eficiente, precisa e com custo reduzido**, conforme o desafio da **Enter AI Fellowship Take-Home Project**.

A arquitetura combina **backend inteligente** e **frontend com paralelização controlada**, garantindo resultados rápidos mesmo para grandes lotes de documentos.

---

## Desafios Mapeados e Soluções

### 1. Evitar retrabalho e reduzir custo de processamento
- **Problema:** Cada documento pode ser processado várias vezes; chamar a LLM para todos os campos é caro e lento.  
- **Solução:**  
  - **Cache completo de documentos processados:** Cada documento é identificado por um hash do PDF + hash do schema. Se ele já foi processado, o resultado é retornado imediatamente (cache hit).  
  - **Histórico de valores por campo:** Para cada `label` de documento, armazenamos os valores já extraídos de campos individuais. Antes de chamar a LLM, o endpoint procura esses valores no texto do novo documento. Se o valor histórico estiver presente, é reutilizado.  

**Exemplo:**  
1. Primeiro documento “Fatura” processado: CPF extraído = `123.456.789-00`, valor armazenado no histórico do `label` "Fatura" para o campo `cpf`.  
2. Novo documento “Fatura” chega com o campo `cpf` no schema: antes de chamar a LLM, o sistema verifica se `123.456.789-00` aparece no texto. Se sim, o campo é preenchido imediatamente.  

**Benefício:** reduz significativamente as chamadas à LLM e acelera a extração para documentos repetidos ou com campos comuns.

---

### 2. Heurísticas locais
- **Pattern matching genérico:** regex para tipos de dados comuns (`cpf`, `cnpj`, `data`, `telefone`, `cep`, `valor`).  
- **Uso seletivo da LLM:** Apenas campos que **não foram preenchidos via cache ou regex** são enviados para GPT-5 mini.  
- **Acurácia mínima de 80% antes de chamar a LLM:** Se a heurística local resolve ≥80% dos campos, não utilizamos a LLM, garantindo economia de tokens e tempo.

---

### 3. Paralelização no frontend com atualização incremental
- **Problema:** Processar um lote grande sequencialmente é lento.  
- **Solução:**  
  - O frontend envia **5 requisições simultâneas** (controle de concorrência) ao backend.  
  - Cada resposta é **atualizada na interface assim que chega**, sem precisar esperar todos os documentos do lote.  
  - **Ordem preservada:** mesmo que um documento processe mais rápido que outro, os resultados são exibidos na mesma ordem do JSON de entrada.  

**Benefícios:**  
- Usuário vê os resultados parciais em tempo real.  
- Maior utilização do servidor sem sobrecarregar recursos.  
- Processamento rápido e eficiente de grandes lotes, mantendo a consistência de ordem.

---

### 4. Estratégias alternativas testadas
- Detecção de posição de campos no PDF e inferência de regex automática para cada campo foram testadas, mas apresentaram baixa confiabilidade.  
- Optou-se por combinar **cache, histórico de valores e pattern matching**, garantindo robustez e rapidez sem depender do layout exato do documento.

---

## Como Utilizar

 Instruções detalhadas de instalação e execução do backend e frontend estão nos READMEs específicos de cada pasta.

### 1. Submissão Única
Para processar **um único documento por vez**:

1. Abra a interface web do frontend e selecione 'Extração Única'.
2. Preencha os campos de texto:
   - **Label:** tipo do documento (ex.: `"fatura"`).  
   - **Extraction Schema:** campos a extrair, no formato JSON (ex.: `{"cpf": "Número de CPF do cliente", "valor": "Valor da fatura"}`).  
3. Anexe o PDF correspondente.
4. Clique em **“Enviar”** para processar o documento.
5. O resultado será exibido na tela assim que a extração for concluída.  

> ![Print Submissão Única](/assets/SubmissaoUnica.png)

---

### 2. Submissão em Lote
Para processar **múltiplos documentos simultaneamente**:

1. Abra a interface web do frontend e selecione 'Extração em Lote'.
2. Selecione um **arquivo JSON** contendo os dados da entrada, no mesmo modelo do JSON fornecido em:  
   [Repositório de dados do AI Fellowship](https://github.com/talismanai/ai-fellowship-data)
3. Selecione a **pasta contendo os PDFs** correspondentes.
4. Clique em **“Enviar Lote”** para iniciar o processamento.
5. Acompanhe os **resultados parciais em tempo real**, que são atualizados à medida que cada documento é processado, preservando a ordem de entrada.
6. Ao final, clique em **“Baixar Resultado Final”** para obter o JSON consolidado.

> ![Print Submissão em Lote](/assets/SubmissaoLote.png)

---

