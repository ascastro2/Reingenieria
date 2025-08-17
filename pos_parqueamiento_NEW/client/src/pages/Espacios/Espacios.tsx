import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalParking,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Espacio {
  id_espacio: number;
  numero_espacio: string;
  tipo_vehiculo: 'auto' | 'camioneta' | 'camion' | 'moto';
  tarifa_hora: number;
  estado: 'libre' | 'ocupado' | 'reservado' | 'mantenimiento';
  fecha_creacion: string;
}

interface EspacioForm {
  numero_espacio: string;
  tipo_vehiculo: 'auto' | 'camioneta' | 'camion' | 'moto';
  tarifa_hora: number;
}

const Espacios: React.FC = () => {
  const { user } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEspacio, setEditingEspacio] = useState<Espacio | null>(null);
  const [formData, setFormData] = useState<EspacioForm>({
    numero_espacio: '',
    tipo_vehiculo: 'auto',
    tarifa_hora: 0
  });

  // Datos de ejemplo para desarrollo
  const espaciosEjemplo: Espacio[] = [
    {
      id_espacio: 1,
      numero_espacio: 'A1',
      tipo_vehiculo: 'auto',
      tarifa_hora: 5.00,
      estado: 'libre',
      fecha_creacion: '2024-01-01'
    },
    {
      id_espacio: 2,
      numero_espacio: 'A2',
      tipo_vehiculo: 'auto',
      tarifa_hora: 5.00,
      estado: 'ocupado',
      fecha_creacion: '2024-01-01'
    },
    {
      id_espacio: 3,
      numero_espacio: 'B1',
      tipo_vehiculo: 'camioneta',
      tarifa_hora: 7.50,
      estado: 'libre',
      fecha_creacion: '2024-01-01'
    }
  ];

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular llamada a API
      setTimeout(() => {
        setEspacios(espaciosEjemplo);
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error al cargar espacios:', error);
      setError('Error al cargar los espacios');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, []);

  const handleOpenDialog = (espacio?: Espacio) => {
    if (espacio) {
      setEditingEspacio(espacio);
      setFormData({
        numero_espacio: espacio.numero_espacio,
        tipo_vehiculo: espacio.tipo_vehiculo,
        tarifa_hora: espacio.tarifa_hora
      });
    } else {
      setEditingEspacio(null);
      setFormData({
        numero_espacio: '',
        tipo_vehiculo: 'auto',
        tarifa_hora: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEspacio(null);
    setFormData({
      numero_espacio: '',
      tipo_vehiculo: 'auto',
      tarifa_hora: 0
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingEspacio) {
        // Simular actualización
        setEspacios(prev => prev.map(esp => 
          esp.id_espacio === editingEspacio.id_espacio 
            ? { ...esp, ...formData }
            : esp
        ));
      } else {
        // Simular creación
        const nuevoEspacio: Espacio = {
          id_espacio: Date.now(),
          ...formData,
          estado: 'libre',
          fecha_creacion: new Date().toISOString().split('T')[0]
        };
        setEspacios(prev => [...prev, nuevoEspacio]);
      }
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error al guardar espacio:', error);
      setError('Error al guardar el espacio');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      try {
        setEspacios(prev => prev.filter(esp => esp.id_espacio !== id));
      } catch (error: any) {
        console.error('Error al eliminar espacio:', error);
        setError('Error al eliminar el espacio');
      }
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'libre':
        return 'success';
      case 'ocupado':
        return 'error';
      case 'reservado':
        return 'warning';
      case 'mantenimiento':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTipoVehiculoLabel = (tipo: string) => {
    switch (tipo) {
      case 'auto':
        return 'Auto';
      case 'camioneta':
        return 'Camioneta';
      case 'camion':
        return 'Camión';
      case 'moto':
        return 'Moto';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
            🚗 Gestión de Espacios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los espacios de parqueamiento del sistema
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEspacios}
          >
            Actualizar
          </Button>
          {user?.rol === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Espacio
            </Button>
          )}
        </Box>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {espacios.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Espacios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {espacios.filter(e => e.estado === 'libre').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Espacios Libres
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {espacios.filter(e => e.estado === 'ocupado').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Espacios Ocupados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {espacios.filter(e => e.estado === 'reservado').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Espacios Reservados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de espacios */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Lista de Espacios
          </Typography>

          {espacios.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <LocalParking sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay espacios registrados
              </Typography>
              <Typography variant="body2">
                Comienza agregando el primer espacio de parqueamiento.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Tipo de Vehículo</TableCell>
                    <TableCell>Tarifa por Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {espacios.map((espacio) => (
                    <TableRow key={espacio.id_espacio} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {espacio.numero_espacio}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTipoVehiculoLabel(espacio.tipo_vehiculo)}
                          color="secondary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          S/ {espacio.tarifa_hora.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={espacio.estado}
                          color={getStatusColor(espacio.estado) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(espacio.fecha_creacion).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {user?.rol === 'admin' && (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(espacio)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(espacio.id_espacio)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar espacio */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEspacio ? 'Editar Espacio' : 'Nuevo Espacio'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Número de Espacio"
              value={formData.numero_espacio}
              onChange={(e) => setFormData({ ...formData, numero_espacio: e.target.value })}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Tipo de Vehículo</InputLabel>
              <Select
                value={formData.tipo_vehiculo}
                label="Tipo de Vehículo"
                onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value as any })}
              >
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="camioneta">Camioneta</MenuItem>
                <MenuItem value="camion">Camión</MenuItem>
                <MenuItem value="moto">Moto</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Tarifa por Hora (S/)"
              type="number"
              value={formData.tarifa_hora}
              onChange={(e) => setFormData({ ...formData, tarifa_hora: parseFloat(e.target.value) || 0 })}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEspacio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Espacios;
