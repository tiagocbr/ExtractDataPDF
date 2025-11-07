"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";

const API_URL = process.env.NEXT_PUBLIC_API;

export default function SingleExtract({setSnackbar}) {
  const [label, setLabel] = useState("");
  const [schema, setSchema] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSingleSubmit = async () => {
     if (!label || !schema || !pdf) {
      setSnackbar({
        open: true,
        message: "Preencha todos os campos antes de enviar.",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("label", label);
      formData.append("extraction_schema", schema);
      formData.append("pdf", pdf);

      const res = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ color: "#EDEDED" }}>
        Extração Individual
      </Typography>
      <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
        Use esta opção para extrair informações de um único arquivo PDF.
        Informe um <b>label</b> descritivo, insira o <b>schema JSON</b> com os
        campos esperados e as descrições e envie o arquivo para processamento.
      </Typography>

      <TextField
        label="Label"
        variant="outlined"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <TextField
        label="Schema (JSON)"
        multiline
        minRows={6}
        value={schema}
        onChange={(e) => setSchema(e.target.value)}
      />

      <Button
        variant="contained"
        component="label"
        sx={{
          bgcolor: "#BBE40A",
          color: "#141416",
          "&:hover": { bgcolor: "#d6ff6b" },
        }}
      >
        Selecionar PDF
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => setPdf(e.target.files[0])}
        />
      </Button>
      {pdf && <Typography variant="body2">📄 {pdf.name}</Typography>}

      <Button
        variant="contained"
        onClick={handleSingleSubmit}
        disabled={loading}
        sx={{
          bgcolor: "#BBE40A",
          color: "#141416",
          "&:hover": { bgcolor: "#d6ff6b" },
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Enviar"}
      </Button>
      {response && (<>
        <Typography variant="h6" gutterBottom>
          Resultado:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          ⏱️ Tempo de processamento:{" "}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {response.time}s
          </Box>
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.1)",
          }}
        >
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </Box>
      </>)}
    </Stack>
  );
}
