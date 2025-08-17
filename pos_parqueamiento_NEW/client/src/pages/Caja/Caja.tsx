import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

const Caja: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        🏦 Control de Caja
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administra la apertura, cierre y reportes de caja
      </Typography>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <AccountBalance sx={{ fontSize: 80, color: '#1976d2', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom>
            Funcionalidad en Desarrollo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El control de caja estará disponible en la próxima versión.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Caja;
