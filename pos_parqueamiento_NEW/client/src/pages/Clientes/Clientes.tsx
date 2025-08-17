import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { People } from '@mui/icons-material';

const Clientes: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        👥 Gestión de Clientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administra la información de los clientes del sistema
      </Typography>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <People sx={{ fontSize: 80, color: '#1976d2', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom>
            Funcionalidad en Desarrollo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La gestión de clientes estará disponible en la próxima versión.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Clientes;
