"use client";

import { useState, useReducer } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Stack,
  LinearProgress,
  Pagination,
} from "@mui/material";

// --- Reducer centralizado
function batchReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return {
        results: Array(action.payload).fill(null),
        completed: 0,
        total: action.payload,
      };
    case "UPDATE_RESULT":
      const updated = [...state.results];
      updated[action.index] = action.data;
      return {
        ...state,
        results: updated,
        completed: state.completed + 1,
      };
    default:
      return state;
  }
}

export default function BatchExtract({setSnackbar}) {
  const [batchJson, setBatchJson] = useState([]);
  const [batchFiles, setBatchFiles] = useState([]);
  const [jsonName, setJsonName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(batchReducer, {
    results: [],
    completed: 0,
    total: 0,
  });
  const [page, setPage] = useState(1);

  const concurrency = 5; // número de requisições simultâneas
  const resultsPerPage = 1; // quantos resultados exibir por página

  // função utilitária pra baixar o resultado final
  const handleDownloadResults = () => {
    // Extrai apenas result.data de cada item do array
    const cleanedResults = state.results.map((item) => item.result?.data ?? null);

    const blob = new Blob([JSON.stringify(cleanedResults, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resultado_final.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchSubmit = async () => {
    if (!batchJson.length || batchFiles.length === 0) {
      setSnackbar({
        open: true,
        message: "Selecione o JSON e a pasta com os PDFs antes de enviar.",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    dispatch({ type: "INIT", payload: batchJson.length });

    try {
      const processItem = async (item, index) => {
        if (!item.label || !item.extraction_schema || !item.pdf_path) {
          dispatch({
            type: "UPDATE_RESULT",
            index,
            data: { file: item?.pdf_path || 'pdf_path não especificado', error: "Label, Extraction_schema ou pdf_path ausentes" },
          });
          return;
        }
        const pdfFile = batchFiles.find((f) => f.name === item.pdf_path);
        if (!pdfFile) {
          dispatch({
            type: "UPDATE_RESULT",
            index,
            data: { file: item.pdf_path, error: "PDF não encontrado" },
          });
          return;
        }

        const formData = new FormData();
        formData.append("label", item.label);
        formData.append("extraction_schema", JSON.stringify(item.extraction_schema));
        formData.append("pdf", pdfFile);

        try {
          const res = await fetch("http://localhost:8000/api/extract", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          dispatch({
            type: "UPDATE_RESULT",
            index,
            data: { file: pdfFile.name, label: item.label, result: data },
          });
        } catch (err) {
          dispatch({
            type: "UPDATE_RESULT",
            index,
            data: { file: pdfFile.name, error: err.message },
          });
        }
      };

      const runBatches = async () => {
        for (let i = 0; i < batchJson.length; i += concurrency) {
          const chunk = batchJson.slice(i, i + concurrency);
          await Promise.all(
            chunk.map((item, idx) => processItem(item, i + idx))
          );
        }
      };

      await runBatches();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "Erro ao processar o lote.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress =
    state.total > 0 ? (state.completed / state.total) * 100 : 0;

  // paginação
  const totalPages = Math.ceil(state.results.length / resultsPerPage);
  const paginatedResults = state.results.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ color: "#EDEDED" }}>
        Extração em Lote
      </Typography>

      <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
        Use esta opção para processar múltiplos arquivos PDF de uma só vez.
        Envie um <b>arquivo JSON</b> contendo as entradas desejadas e anexe os respectivos <b>PDFs</b>.
        Os resultados de cada documento serão exibidos conforme o processamento avança,
        e, ao final, você poderá <b>baixar o JSON completo</b> com todos os resultados consolidados.
      </Typography>

      {/* Selecionar JSON */}
      <Button
        variant="contained"
        component="label"
        sx={{
          bgcolor: "#BBE40A",
          color: "#141416",
          "&:hover": { bgcolor: "#d6ff6b" },
        }}
      >
        Selecionar JSON
        <input
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setJsonName(file.name);
              file.text().then((text) => {
                try {
                  const parsed = JSON.parse(text);
                  setBatchJson(parsed);
                } catch {
                  setSnackbar({
                    open: true,
                    message: "O JSON selecionado é inválido.",
                    severity: "error",
                  });
                  
                }
              });
            }
          }}
        />
      </Button>
      {jsonName && <Typography variant="body2">✅ {jsonName} selecionado</Typography>}

      {/* Selecionar Pasta */}
      <Button
        variant="contained"
        component="label"
        sx={{
          bgcolor: "#BBE40A",
          color: "#141416",
          "&:hover": { bgcolor: "#d6ff6b" },
        }}
      >
        Selecionar Pasta com PDFs
        <input
          type="file"
          accept="application/pdf"
          multiple
          hidden
          webkitdirectory="true"
          directory=""
          onChange={(e) => {
            const files = Array.from(e.target.files).filter((f) =>
              f.name.toLowerCase().endsWith(".pdf")
            );
            setBatchFiles(files);
            const folder = files[0]?.webkitRelativePath?.split("/")[0];
            setFolderName(folder || "");
          }}
        />
      </Button>
      {folderName && <Typography variant="body2">📁 Pasta: {folderName}</Typography>}
      {batchFiles.length > 0 && (
        <Typography variant="body2">
          📂 {batchFiles.length} arquivos selecionados
        </Typography>
      )}

      {/* Botão de envio */}
      <Button
        variant="contained"
        onClick={handleBatchSubmit}
        disabled={loading}
        sx={{
          bgcolor: "#BBE40A",
          color: "#141416",
          "&:hover": { bgcolor: "#d6ff6b" },
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Enviar Lote"}
      </Button>

      {loading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ color: "#B0B0B0", mt: 0.5 }}>
            {`${Math.round(progress)}% concluído`}
          </Typography>
        </Box>
      )}

      
      {/* Resultados parciais com paginação */}
      {state.results.some((r) => r !== null) && (<>
      <Typography variant="h6" gutterBottom>
        Resultados:
      </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.1)",
            maxHeight: 700,
            overflowY: "auto",
          }}
        >

          {paginatedResults.map((r, i) => {
            const index = (page - 1) * resultsPerPage + i;
            return (
              <Box key={index} sx={{ mb: 1 }}>
                {r ? (<>
                  <Typography variant="body2" gutterBottom>
                    {r.file}
                  </Typography>
                  <pre>
                    {r.result?.data
                      ? JSON.stringify(r.result.data, null, 2)
                      : JSON.stringify(r.error ?? "Erro desconhecido", null, 2)}
                  </pre>
                </>) : (
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    ⏳ Processando {batchJson[index]?.pdf_path}
                  </Typography>
                )}
              </Box>
            );
          })}

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                "& .MuiPaginationItem-root": { color: "#EDEDED" },
              }}
            />
          )}
        </Box>
      </>)}

      {/* Botão de download final */}
      {!loading && state.completed === state.total && state.total > 0 && (
        <Button
          variant="outlined"
          onClick={handleDownloadResults}
          sx={{
            mt: 1,
            borderColor: "#BBE40A",
            color: "#BBE40A",
            "&:hover": {
              bgcolor: "rgba(187,228,10,0.1)",
              borderColor: "#d6ff6b",
            },
          }}
        >
          📥 Baixar Resultado Final
        </Button>
      )}
    </Stack>
  );
}
