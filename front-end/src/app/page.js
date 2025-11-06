"use client";

import { useState } from "react";
import { Tabs, Tab, Box, Paper, Typography, Snackbar, Alert } from "@mui/material";
import SingleExtract from "@/components/SingleExtract";
import BatchExtract from "@/components/BatchExtract";
import background from "@/public/background.svg";

export default function ExtractPage() {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 5, px: 2 }}>

      <Box 
        sx={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${background.src})`,
          backgroundRepeat: "repeat-y", 
          backgroundPosition: "top center", 
          backgroundSize: "100% auto",
          opacity: 0.05,
          pointerEvents: "none",
          zIndex: 0, 
        }} 
      />
      <Paper
        sx={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{color: '#BBE40A',textAlign:'center'}}>
            Extrator de Dados de PDFs
        </Typography>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: "#BBE40A" } }}
          sx={{ mb: 3 }}
        >
          <Tab label="Extração única" />
          <Tab label="Extração em lote" />
        </Tabs>

        <Box>
          {tab === 0 && <SingleExtract setSnackbar={setSnackbar} />}
          {tab === 1 && <BatchExtract setSnackbar={setSnackbar} />}
        </Box>

      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor:
              snackbar.severity === "success"
                ? "#BBE40A"
                : snackbar.severity === "error"
                ? "#C4161C"
                : snackbar.severity === "warning"
                ? "#F4AF25"
                : "#222255",
            color:
              snackbar.severity === "success"
                ? "#141416"
                : "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
