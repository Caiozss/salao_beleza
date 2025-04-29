import React from 'react';
import { Container, Typography, Box, Grid, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Box sx={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/salon-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        mb: 6
      }}>
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Salão de Beleza
          </Typography>
          <Typography variant="h5" paragraph>
            Beleza e bem-estar em um só lugar
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/agendamento')}
            sx={{ mt: 2 }}
          >
            Agende seu Horário
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box my={6}>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Nossos Serviços
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Conheça os serviços que oferecemos para você
          </Typography>
          
          <Box sx={{ flexGrow: 1, mt: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <img src="/images/hair.jpg" alt="Cabelo" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Cabelo
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cortes, coloração, tratamentos e penteados para todos os tipos de cabelo.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/agendamento?servico=cabelo')}
                    sx={{ mt: 2 }}
                  >
                    Ver Serviços
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <img src="/images/nails.jpg" alt="Unhas" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Unhas
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manicure, pedicure, unhas em gel, alongamento e decoração.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/agendamento?servico=unhas')}
                    sx={{ mt: 2 }}
                  >
                    Ver Serviços
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <img src="/images/esthetic.jpg" alt="Estética" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Estética
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Limpeza de pele, tratamentos faciais, massagens e depilação.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/agendamento?servico=estetica')}
                    sx={{ mt: 2 }}
                  >
                    Ver Serviços
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        
        <Box my={6}>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Por que nos escolher?
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Conheça as vantagens de ser nosso cliente
          </Typography>
          
          <Box sx={{ flexGrow: 1, mt: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Profissionais Qualificados
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nossa equipe é formada por profissionais experientes e constantemente atualizados com as últimas tendências.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Produtos de Qualidade
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Utilizamos apenas produtos de alta qualidade e das melhores marcas do mercado.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Ambiente Acolhedor
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nosso espaço foi projetado para proporcionar conforto e bem-estar durante todo o atendimento.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        
        <Box my={6} textAlign="center">
          <Typography variant="h4" component="h2" gutterBottom>
            Agende seu Horário
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Escolha o serviço, profissional, data e horário de sua preferência
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/agendamento')}
            sx={{ mt: 2 }}
          >
            Agendar Agora
          </Button>
        </Box>
      </Container>
      
      <Footer />
    </>
  );
};

export default Home;
