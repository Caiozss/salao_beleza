import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ptBR } from '@mui/material/locale';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Agendamento from './pages/Agendamento';
import MeusAgendamentos from './pages/MeusAgendamentos';
import Admin from './pages/Admin';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#8e44ad', // Roxo
    },
    secondary: {
      main: '#e74c3c', // Vermelho
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
}, ptBR);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
