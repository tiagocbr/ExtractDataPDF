"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import theme from "../theme";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
