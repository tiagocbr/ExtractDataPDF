import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // forçamos o modo escuro para manter fundo preto
    background: {
      default: "#0B0B0C", // fundo da tela
      paper: "#141416",   // fundo dos componentes Paper
    },
    primary: {
      main: "#BBE40A", // cor principal do botão e destaque
      contrastText: "#141416", // cor do texto nos botões
    },
    text: {
      primary: "#EDEDED", // texto padrão
    },
  },
  typography: {
    fontFamily: "'Barlow', sans-serif",
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          padding: "10px 28px",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#d6ff6b",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #BBE40A",
          backgroundColor: "#141416",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            color: "#EDEDED",
            "& fieldset": {
              borderColor: "#BBE40A",
            },
            "&:hover fieldset": {
              borderColor: "#d6ff6b",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#d6ff6b",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#B0B0B0",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          color: "#BBE40A",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#BBE40A",
          },
        },
      },
    },
  },
});

export default theme;
