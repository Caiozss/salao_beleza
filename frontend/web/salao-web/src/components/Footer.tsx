import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Salão de Beleza
            </Typography>
            <Typography variant="body2">
              Transformando sua beleza com profissionalismo e qualidade.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Typography variant="body2">
              Telefone: (XX) XXXX-XXXX
            </Typography>
            <Typography variant="body2">
              Email: contato@salaodebeleza.com
            </Typography>
            <Typography variant="body2">
              Endereço: Rua Exemplo, 123 - Cidade
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Links Rápidos
            </Typography>
            <Typography variant="body2">
              <MuiLink component={Link} to="/" color="inherit">
                Início
              </MuiLink>
            </Typography>
            <Typography variant="body2">
              <MuiLink component={Link} to="/agendamento" color="inherit">
                Agendar
              </MuiLink>
            </Typography>
            <Typography variant="body2">
              <MuiLink component={Link} to="/meus-agendamentos" color="inherit">
                Meus Agendamentos
              </MuiLink>
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            © {new Date().getFullYear()} Salão de Beleza. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
