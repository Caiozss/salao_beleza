import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Grid, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Lógica de login
      if (!email || !senha) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos.',
          severity: 'error'
        });
        return;
      }
      
      try {
        setLoading(true);
        // Implementação futura: integração com autenticação
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Login realizado com sucesso!',
          severity: 'success'
        });
        
        // Redirecionar para o painel administrativo
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
        
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Erro ao fazer login. Verifique suas credenciais.',
          severity: 'error'
        });
      }
    } else {
      // Lógica de cadastro
      if (!nome || !email || !senha || !confirmarSenha || !telefone) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos.',
          severity: 'error'
        });
        return;
      }
      
      if (senha !== confirmarSenha) {
        setSnackbar({
          open: true,
          message: 'As senhas não coincidem.',
          severity: 'error'
        });
        return;
      }
      
      try {
        setLoading(true);
        // Implementação futura: integração com cadastro de usuários
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Cadastro realizado com sucesso! Faça login para continuar.',
          severity: 'success'
        });
        
        // Limpar campos e voltar para tela de login
        setNome('');
        setEmail('');
        setSenha('');
        setConfirmarSenha('');
        setTelefone('');
        setIsLogin(true);
        
      } catch (error) {
        console.error('Erro ao fazer cadastro:', error);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Erro ao fazer cadastro. Tente novamente.',
          severity: 'error'
        });
      }
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            {isLogin 
              ? 'Faça login para acessar o painel administrativo' 
              : 'Preencha os dados abaixo para criar sua conta'}
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {!isLogin && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Nome Completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                {!isLogin && (
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Confirmar Senha"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            
            <Box mt={3} textAlign="center">
              <Button
                color="primary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin 
                  ? 'Não tem uma conta? Cadastre-se' 
                  : 'Já tem uma conta? Faça login'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </>
  );
};

export default Login;
