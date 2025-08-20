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
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Configuracion {
  id_config: number;
  nombre_empresa: string;
  ruc_empresa: string;
  direccion_empresa: string;
  telefono_empresa: string;
  email_empresa: string;
  tarifa_base: number;
  tarifa_moto: number;
  tarifa_camioneta: number;
  tarifa_camion: number;
  iva_porcentaje: number;
  estado: 'activa' | 'inactiva';
  fecha_creacion: string;
}

interface ConfiguracionForm {
  nombre_empresa: string;
  ruc_empresa: string;
  direccion_empresa: string;
  telefono_empresa: string;
  email_empresa: string;
  tarifa_base: number;
  tarifa_moto: number;
  tarifa_camioneta: number;
  tarifa_camion: number;
  iva_porcentaje: number;
}

const Configuracion: React.FC = () => {
  const { user } = useAuth();
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [configuracionActual, setConfiguracionActual] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRestaurarDialog, setOpenRestaurarDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuracion | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState<ConfiguracionForm>({
    nombre_empresa: '',
    ruc_empresa: '',
    direccion_empresa: '',
    telefono_empresa: '',
    email_empresa: '',
    tarifa_base: 0,
    tarifa_moto: 0,
    tarifa_camioneta: 0,
    tarifa_camion: 0,
    iva_porcentaje: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [configsResponse, configActualResponse] = await Promise.all([
        axios.get('/api/configuracion'),
        axios.get('/api/configuracion/empresa/info')
      ]);

      // Asegurar que configuraciones sea siempre un array y ordenar por ID
      const configData = configsResponse.data.data;
      let configsArray = [];
      
      if (Array.isArray(configData)) {
        configsArray = configData.sort((a, b) => a.id_config - b.id_config);
      } else if (configData && typeof configData === 'object') {
        // Si es un objeto individual, convertirlo en array
        configsArray = [configData];
      }
      
      setConfiguraciones(configsArray);
      
      // Establecer la configuración actual (la primera activa o la primera en la lista)
      if (configActualResponse.data.data) {
        setConfiguracionActual(configActualResponse.data.data);
      } else if (configsArray.length > 0) {
        // Si no hay configuración actual específica, usar la primera activa o la primera en la lista
        const configActiva = configsArray.find(c => c.estado === 'activa');
        setConfiguracionActual(configActiva || configsArray[0]);
      }
    } catch (error: any) {
      console.error('Error al cargar configuración:', error);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (config?: Configuracion) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        nombre_empresa: config.nombre_empresa,
        ruc_empresa: config.ruc_empresa,
        direccion_empresa: config.direccion_empresa,
        telefono_empresa: config.telefono_empresa,
        email_empresa: config.email_empresa,
        tarifa_base: config.tarifa_base,
        tarifa_moto: config.tarifa_moto,
        tarifa_camioneta: config.tarifa_camioneta,
        tarifa_camion: config.tarifa_camion,
        iva_porcentaje: config.iva_porcentaje
      });
    } else {
      setEditingConfig(null);
      setFormData({
        nombre_empresa: '',
        ruc_empresa: '',
        direccion_empresa: '',
        telefono_empresa: '',
        email_empresa: '',
        tarifa_base: 0,
        tarifa_moto: 0,
        tarifa_camioneta: 0,
        tarifa_camion: 0,
        iva_porcentaje: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
    setFormData({
      nombre_empresa: '',
      ruc_empresa: '',
      direccion_empresa: '',
      telefono_empresa: '',
      email_empresa: '',
      tarifa_base: 0,
      tarifa_moto: 0,
      tarifa_camioneta: 0,
      tarifa_camion: 0,
      iva_porcentaje: 0
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingConfig) {
        await axios.put(`/api/configuracion/${editingConfig.id_config}`, formData);
      } else {
        await axios.post('/api/configuracion', formData);
      }
      
      fetchData();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      setError(error.response?.data?.error || 'Error al guardar la configuración');
    }
  };

  const handleRestaurar = async (config: Configuracion) => {
    try {
      await axios.post(`/api/configuracion/${config.id_config}/restaurar`);
      fetchData();
      setOpenRestaurarDialog(false);
    } catch (error: any) {
      console.error('Error al restaurar configuración:', error);
      setError(error.response?.data?.error || 'Error al restaurar la configuración');
    }
  };

  const handleActivarDesactivar = async (config: Configuracion) => {
    try {
      const nuevoEstado = config.estado === 'activa' ? 'inactiva' : 'activa';
      await axios.put(`/api/configuracion/${config.id_config}/estado`, { estado: nuevoEstado });
      fetchData();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      setError(error.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
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
            ⚙️ Configuración del Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configura los parámetros generales del sistema
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Actualizar
          </Button>
          
          {user?.rol === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#1976d2' }}
            >
              Nueva Configuración
            </Button>
          )}
        </Box>
      </Box>

      {/* Configuración actual */}
      {configuracionActual && (
        <Card sx={{ mb: 4, bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" color="primary" fontWeight={600}>
                      Configuración Activa
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {configuracionActual.nombre_empresa}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      RUC: {configuracionActual.ruc_empresa}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="success.main" fontWeight={600}>
                          {formatCurrency(configuracionActual.tarifa_base || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tarifa Base (Auto)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="warning.main" fontWeight={600}>
                          {configuracionActual.iva_porcentaje ? `${configuracionActual.iva_porcentaje}%` : '0%'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          IVA
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {Array.isArray(configuraciones) ? configuraciones.length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Configuraciones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {Array.isArray(configuraciones) ? configuraciones.filter(c => c.estado === 'activa').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configuraciones Activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Array.isArray(configuraciones) ? configuraciones.filter(c => c.estado === 'inactiva').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configuraciones Inactivas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {configuracionActual ? formatDateTime(configuracionActual.fecha_creacion) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última Actualización
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

      {/* Tabla de configuraciones */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Historial de Configuraciones
          </Typography>

          {configuraciones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <SettingsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay configuraciones registradas
              </Typography>
              <Typography variant="body2">
                Comienza creando la primera configuración del sistema.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>RUC</TableCell>
                      <TableCell>Tarifa Base</TableCell>
                      <TableCell>IVA</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha Creación</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configuraciones.map((config) => (
                      <TableRow key={config.id_config} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{config.id_config}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {config.nombre_empresa}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {config.ruc_empresa}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(config.tarifa_base)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {config.iva_porcentaje}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={config.estado === 'activa' ? 'Activa' : 'Inactiva'}
                            color={config.estado === 'activa' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(config.fecha_creacion)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {user?.rol === 'admin' && (
                              <>
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenDialog(config)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Restaurar">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => setOpenRestaurarDialog(true)}
                                  >
                                    <RestoreIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title={config.estado === 'activa' ? 'Desactivar' : 'Activar'}>
                                  <IconButton
                                    size="small"
                                    color={config.estado === 'activa' ? 'error' : 'success'}
                                    onClick={() => handleActivarDesactivar(config)}
                                  >
                                    <Switch
                                      checked={config.estado === 'activa'}
                                      size="small"
                                      onChange={() => handleActivarDesactivar(config)}
                                    />
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
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={configuraciones.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar configuración */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingConfig ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
            {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de la Empresa *"
                value={formData.nombre_empresa}
                onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUC *"
                value={formData.ruc_empresa}
                onChange={(e) => setFormData({ ...formData, ruc_empresa: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono *"
                value={formData.telefono_empresa}
                onChange={(e) => setFormData({ ...formData, telefono_empresa: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email_empresa}
                onChange={(e) => setFormData({ ...formData, email_empresa: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.direccion_empresa}
                onChange={(e) => setFormData({ ...formData, direccion_empresa: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6" color="primary">
                  <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Tarifas por Hora
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tarifa Base (Auto) *"
                type="number"
                value={formData.tarifa_base}
                onChange={(e) => setFormData({ ...formData, tarifa_base: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tarifa Moto *"
                type="number"
                value={formData.tarifa_moto}
                onChange={(e) => setFormData({ ...formData, tarifa_moto: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tarifa Camioneta *"
                type="number"
                value={formData.tarifa_camioneta}
                onChange={(e) => setFormData({ ...formData, tarifa_camioneta: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tarifa Camión *"
                type="number"
                value={formData.tarifa_camion}
                onChange={(e) => setFormData({ ...formData, tarifa_camion: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Porcentaje de IVA *"
                type="number"
                value={formData.iva_porcentaje}
                onChange={(e) => setFormData({ ...formData, iva_porcentaje: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1976d2' }}>
            {editingConfig ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para restaurar configuración */}
      <Dialog open={openRestaurarDialog} onClose={() => setOpenRestaurarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestoreIcon color="warning" />
            Restaurar Configuración
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres restaurar esta configuración?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Esta acción desactivará la configuración actual y activará la seleccionada.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestaurarDialog(false)}>Cancelar</Button>
          <Button onClick={() => handleRestaurar(configuraciones[0])} variant="contained" color="warning">
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuracion;
