import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Receipt } from '@mui/icons-material';

const Ventas: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        💰 Gestión de Ventas
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administra las ventas y facturación del sistema
      </Typography>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 80, color: '#1976d2', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom>
            Funcionalidad en Desarrollo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La gestión de ventas estará disponible en la próxima versión.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Ventas;
