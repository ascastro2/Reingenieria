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
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import axios from 'axios';

interface Venta {
  id_venta: number;
  fecha_venta: string;
  hora_entrada: string;
  hora_salida?: string | null;
  tiempo_total?: number | null;
  tarifa_hora: number | null;
  monto_total?: number | null;
  estado: 'activa' | 'finalizada' | 'cancelada' | null;
  id_cliente?: number | null;
  id_espacio: number;
  id_usuario: number;
  placa_vehiculo: string | null;
  tipo_vehiculo: string | null;
  observaciones?: string | null;
  observaciones_salida?: string | null;
  motivo_cancelacion?: string | null;
  // Campos relacionados (nombres exactos del backend)
  Nombre_Cliente?: string | null;
  Apellido_Cliente?: string | null;
  numero_espacio?: string | null;
  nombre_usuario?: string | null;
}

interface VentaForm {
  id_espacio: number;
  id_cliente?: number;
  placa_vehiculo: string;
  tipo_vehiculo: string;
  observaciones: string;
}

interface Espacio {
  id_espacio: number;
  numero_espacio: string;
  tipo_vehiculo: string;
  tarifa_hora: number;
  estado: string;
}

interface Cliente {
  idCliente: number;
  Nombre_Cliente: string;
  Apellido_Cliente: string;
  ruc_Cliente?: string;
}

const Ventas: React.FC = () => {

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFinalizarDialog, setOpenFinalizarDialog] = useState(false);
  const [openCancelarDialog, setOpenCancelarDialog] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<VentaForm>({
    id_espacio: 0,
    id_cliente: undefined,
    placa_vehiculo: '',
    tipo_vehiculo: 'auto',
    observaciones: ''
  });

  const [finalizarForm, setFinalizarForm] = useState({
    observaciones_salida: ''
  });

  const [cancelarForm, setCancelarForm] = useState({
    motivo_cancelacion: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ventasResponse, espaciosResponse, clientesResponse] = await Promise.all([
        axios.get('/api/ventas'),
        axios.get('/api/espacios/libres'),
        axios.get('/api/clientes')
      ]);

      console.log('Ventas recibidas:', ventasResponse.data.data);
      console.log('Espacios recibidos:', espaciosResponse.data.data);
      console.log('Clientes recibidos:', clientesResponse.data.data);
      
      setVentas(ventasResponse.data.data);
      setEspacios(espaciosResponse.data.data);
      setClientes(clientesResponse.data.data);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    setFormData({
      id_espacio: 0,
      id_cliente: undefined,
      placa_vehiculo: '',
      tipo_vehiculo: 'auto',
      observaciones: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      id_espacio: 0,
      id_cliente: undefined,
      placa_vehiculo: '',
      tipo_vehiculo: 'auto',
      observaciones: ''
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      if (!formData.id_espacio || !formData.placa_vehiculo.trim()) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      setIsSubmitting(true);
      await axios.post('/api/ventas', formData);
      fetchData();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error al crear venta:', error);
      setError(error.response?.data?.error || 'Error al crear la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizar = async () => {
    if (!selectedVenta || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`/api/ventas/${selectedVenta.id_venta}/finalizar`, finalizarForm);
      fetchData();
      setOpenFinalizarDialog(false);
      setSelectedVenta(null);
      setFinalizarForm({ observaciones_salida: '' });
    } catch (error: any) {
      console.error('Error al finalizar venta:', error);
      if (error.response?.status === 429) {
        setError('Demasiadas peticiones. Por favor espera un momento antes de intentar nuevamente.');
      } else {
        setError(error.response?.data?.error || 'Error al finalizar la venta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = async () => {
    if (!selectedVenta || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`/api/ventas/${selectedVenta.id_venta}/cancelar`, cancelarForm);
      fetchData();
      setOpenCancelarDialog(false);
      setSelectedVenta(null);
      setCancelarForm({ motivo_cancelacion: '' });
    } catch (error: any) {
      console.error('Error al cancelar venta:', error);
      if (error.response?.status === 429) {
        setError('Demasiadas peticiones. Por favor espera un momento antes de intentar nuevamente.');
      } else {
        setError(error.response?.data?.error || 'Error al cancelar la venta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFinalizarVenta = (venta: Venta) => {
    if (!venta || !venta.id_venta) {
      console.error('Venta inválida para finalizar:', venta);
      return;
    }
    setSelectedVenta(venta);
    setOpenFinalizarDialog(true);
  };

  const openCancelarVenta = (venta: Venta) => {
    if (!venta || !venta.id_venta) {
      console.error('Venta inválida para cancelar:', venta);
      return;
    }
    setSelectedVenta(venta);
    setOpenCancelarDialog(true);
  };

  const filteredVentas = ventas.filter(venta => {
    // Validar que la venta tenga al menos los campos mínimos para mostrar
    if (!venta || !venta.id_venta) {
      console.warn('Venta sin ID:', venta);
      return false;
    }
    
    // Si no hay término de búsqueda, mostrar todas las ventas válidas
    if (!searchTerm.trim()) {
      return true;
    }
    
    // Validar que searchTerm no sea undefined
    const searchLower = searchTerm.toLowerCase();
    
         return (
       (venta.placa_vehiculo || '').toLowerCase().includes(searchLower) ||
       (venta.numero_espacio || '').toLowerCase().includes(searchLower) ||
       (venta.Nombre_Cliente || '').toLowerCase().includes(searchLower) ||
       (venta.Apellido_Cliente || '').toLowerCase().includes(searchLower)
     );
  });

  const paginatedVentas = filteredVentas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (estado: string | null | undefined) => {
    if (!estado) return 'default';
    
    switch (estado) {
      case 'activa':
        return 'warning';
      case 'finalizada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (estado: string | null | undefined) => {
    if (!estado) return 'N/A';
    
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'finalizada':
        return 'Finalizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'S/ 0.00';
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
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
            💰 Gestión de Ventas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las ventas y facturación del sistema
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ bgcolor: '#1976d2' }}
        >
          Nueva Venta
        </Button>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {ventas.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {ventas.filter(v => v.estado === 'activa').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas Activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {ventas.filter(v => v.estado === 'finalizada').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas Finalizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {ventas.filter(v => v.estado === 'cancelada').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas Canceladas
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

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por placa, espacio o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                variant="outlined"
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Lista de Ventas
          </Typography>

          {paginatedVentas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <ReceiptIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay ventas registradas
              </Typography>
              <Typography variant="body2">
                Comienza creando la primera venta de parqueamiento.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Espacio</TableCell>
                      <TableCell>Vehículo</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                                                              {paginatedVentas.map((venta) => {
                       // Validar que la venta tenga al menos los campos mínimos
                       if (!venta || !venta.id_venta) {
                         console.warn('Venta inválida en renderizado:', venta);
                         return null;
                       }
                       
                       return (
                         <TableRow key={venta.id_venta} hover>
                           <TableCell>
                             <Typography variant="body2" fontWeight={600}>
                               #{venta.id_venta}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2">
                               {new Date(venta.fecha_venta).toLocaleDateString()}
                             </Typography>
                             <Typography variant="caption" color="text.secondary">
                               {new Date(venta.hora_entrada).toLocaleTimeString()}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={venta.numero_espacio || 'N/A'} 
                               color="primary" 
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             <Box>
                               <Typography variant="body2" fontWeight={600}>
                                 {venta.placa_vehiculo || 'Sin placa'}
                               </Typography>
                               <Chip 
                                 label={venta.tipo_vehiculo || 'N/A'} 
                                 color="secondary" 
                                 size="small"
                               />
                             </Box>
                           </TableCell>
                           <TableCell>
                             {venta.Nombre_Cliente ? (
                               <Typography variant="body2">
                                 {venta.Nombre_Cliente} {venta.Apellido_Cliente}
                               </Typography>
                             ) : (
                               <Typography variant="body2" color="text.secondary">
                                 Sin cliente
                               </Typography>
                             )}
                           </TableCell>
                           <TableCell>
                             <Chip
                               label={getStatusLabel(venta.estado)}
                               color={getStatusColor(venta.estado) as any}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             {venta.monto_total ? (
                               <Typography variant="body2" fontWeight={600} color="success.main">
                                 {formatCurrency(venta.monto_total)}
                               </Typography>
                             ) : (
                               <Typography variant="body2" color="text.secondary">
                                 Pendiente
                               </Typography>
                             )}
                           </TableCell>
                           <TableCell>
                             <Box sx={{ display: 'flex', gap: 1 }}>
                               <Tooltip title="Ver detalles">
                                 <IconButton size="small" color="primary">
                                   <VisibilityIcon />
                                 </IconButton>
                               </Tooltip>
                               
                               {venta.estado === 'activa' && (
                                 <>
                                   <Tooltip title="Finalizar venta">
                                     <IconButton 
                                       size="small" 
                                       color="success"
                                       onClick={() => openFinalizarVenta(venta)}
                                     >
                                       <CheckCircleIcon />
                                     </IconButton>
                                   </Tooltip>
                                   
                                   <Tooltip title="Cancelar venta">
                                     <IconButton 
                                       size="small" 
                                       color="error"
                                       onClick={() => openCancelarVenta(venta)}
                                     >
                                       <CancelIcon />
                                     </IconButton>
                                   </Tooltip>
                                 </>
                               )}
                             </Box>
                           </TableCell>
                         </TableRow>
                       );
                     })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredVentas.length}
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

      {/* Dialog para crear nueva venta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Nueva Venta de Parqueamiento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Espacio</InputLabel>
                <Select
                  value={formData.id_espacio}
                  label="Espacio"
                  onChange={(e) => setFormData({ ...formData, id_espacio: e.target.value as number })}
                >
                  {espacios.map((espacio) => (
                    <MenuItem key={espacio.id_espacio} value={espacio.id_espacio}>
                      {espacio.numero_espacio} - {espacio.tipo_vehiculo} (S/ {typeof espacio.tarifa_hora === 'number' ? espacio.tarifa_hora : 0}/h)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente (Opcional)</InputLabel>
                <Select
                  value={formData.id_cliente || ''}
                  label="Cliente (Opcional)"
                  onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value as number || undefined })}
                >
                  <MenuItem value="">Sin cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.Nombre_Cliente} {cliente.Apellido_Cliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Placa del Vehículo *"
                value={formData.placa_vehiculo}
                onChange={(e) => setFormData({ ...formData, placa_vehiculo: e.target.value.toUpperCase() })}
                required
                placeholder="ABC-123"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Vehículo</InputLabel>
                <Select
                  value={formData.tipo_vehiculo}
                  label="Tipo de Vehículo"
                  onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value as string })}
                >
                  <MenuItem value="auto">Auto</MenuItem>
                  <MenuItem value="camioneta">Camioneta</MenuItem>
                  <MenuItem value="camion">Camión</MenuItem>
                  <MenuItem value="moto">Moto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                multiline
                rows={3}
                placeholder="Observaciones adicionales sobre la venta..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
                     <Button 
             onClick={handleSubmit} 
             variant="contained" 
             disabled={isSubmitting}
             sx={{ bgcolor: '#1976d2' }}
           >
             {isSubmitting ? 'Creando...' : 'Crear Venta'}
           </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para finalizar venta */}
      <Dialog open={openFinalizarDialog} onClose={() => setOpenFinalizarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Finalizar Venta #{selectedVenta?.id_venta}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres finalizar esta venta?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Se calculará el monto total basado en el tiempo transcurrido.
            </Typography>
            
            <TextField
              fullWidth
              label="Observaciones de Salida"
              value={finalizarForm.observaciones_salida}
              onChange={(e) => setFinalizarForm({ observaciones_salida: e.target.value })}
              multiline
              rows={3}
              placeholder="Observaciones sobre la salida del vehículo..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalizarDialog(false)}>Cancelar</Button>
                     <Button 
             onClick={handleFinalizar} 
             variant="contained" 
             color="success"
             disabled={isSubmitting}
           >
             {isSubmitting ? 'Finalizando...' : 'Finalizar Venta'}
           </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cancelar venta */}
      <Dialog open={openCancelarDialog} onClose={() => setOpenCancelarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon color="error" />
            Cancelar Venta #{selectedVenta?.id_venta}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres cancelar esta venta?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Esta acción liberará el espacio de parqueamiento.
            </Typography>
            
            <TextField
              fullWidth
              label="Motivo de Cancelación *"
              value={cancelarForm.motivo_cancelacion}
              onChange={(e) => setCancelarForm({ motivo_cancelacion: e.target.value })}
              multiline
              rows={3}
              placeholder="Especifica el motivo de la cancelación..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelarDialog(false)}>Cancelar</Button>
                     <Button 
             onClick={handleCancelar} 
             variant="contained" 
             color="error"
             disabled={isSubmitting}
           >
             {isSubmitting ? 'Cancelando...' : 'Cancelar Venta'}
           </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ventas;
