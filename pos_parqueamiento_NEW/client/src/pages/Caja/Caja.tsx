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
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon
} from '@mui/icons-material';

import axios from 'axios';

interface Caja {
  id_caja: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  monto_inicial: number;
  monto_final?: number;
  estado: 'abierta' | 'cerrada';
  id_usuario: number;
  observaciones?: string;
  total_ventas?: number;
  total_ventas_finalizadas?: number;
  total_ventas_canceladas?: number;
  total_ingresos_manuales?: number;
  total_egresos?: number;
  saldo_actual?: number;
  total_retiros?: number;
  nombre_usuario?: string;
  apellido_usuario?: string;
}

interface Movimiento {
  id_movimiento: number;
  id_caja: number;
  tipo_movimiento: 'ingreso' | 'egreso' | 'retiro';
  monto: number;
  descripcion: string;
  fecha_movimiento: string;
  id_usuario: number;
  nombre_usuario?: string;
  apellido_usuario?: string;
}

interface CajaForm {
  monto_inicial: number;
  observaciones: string;
}

interface MovimientoForm {
  monto: number;
  concepto: string;
}

const Caja: React.FC = () => {

  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaActual, setCajaActual] = useState<Caja | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAbrirDialog, setOpenAbrirDialog] = useState(false);
  const [openCerrarDialog, setOpenCerrarDialog] = useState(false);
  const [openAgregarDialog, setOpenAgregarDialog] = useState(false);
  const [openRetirarDialog, setOpenRetirarDialog] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [abrirForm, setAbrirForm] = useState<CajaForm>({
    monto_inicial: 0,
    observaciones: ''
  });

  const [cerrarForm, setCerrarForm] = useState({
    monto_final: 0,
    observaciones: ''
  });

  const [movimientoForm, setMovimientoForm] = useState<MovimientoForm>({
    monto: 0,
    concepto: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cajasResponse, cajaActualResponse] = await Promise.all([
        axios.get('/api/caja'),
        axios.get('/api/caja/actual/estado')
      ]);

      setCajas(cajasResponse.data.data);
      
      if (cajaActualResponse.data.data.estado === 'abierta') {
        setCajaActual(cajaActualResponse.data.data);
        // Obtener movimientos de la caja actual
        const movimientosResponse = await axios.get(`/api/caja/${cajaActualResponse.data.data.id_caja}/movimientos`);
        setMovimientos(movimientosResponse.data.data);
      } else {
        setCajaActual(null);
        setMovimientos([]);
      }
    } catch (error: any) {
      console.error('Error al cargar datos de caja:', error);
      setError('Error al cargar los datos de caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAbrirCaja = async () => {
    try {
      await axios.post('/api/caja/abrir', abrirForm);
      fetchData();
      setOpenAbrirDialog(false);
      setAbrirForm({ monto_inicial: 0, observaciones: '' });
    } catch (error: any) {
      console.error('Error al abrir caja:', error);
      setError(error.response?.data?.error || 'Error al abrir la caja');
    }
  };

  const handleCerrarCaja = async () => {
    if (!cajaActual) return;
    
    try {
      await axios.put(`/api/caja/${cajaActual.id_caja}/cerrar`, cerrarForm);
      fetchData();
      setOpenCerrarDialog(false);
      setCerrarForm({ monto_final: 0, observaciones: '' });
    } catch (error: any) {
      console.error('Error al cerrar caja:', error);
      setError(error.response?.data?.error || 'Error al cerrar la caja');
    }
  };

  const handleAgregarMonto = async () => {
    if (!cajaActual) return;
    
    try {
      await axios.put(`/api/caja/${cajaActual.id_caja}/agregar`, movimientoForm);
      fetchData();
      setOpenAgregarDialog(false);
      setMovimientoForm({ monto: 0, concepto: '' });
    } catch (error: any) {
      console.error('Error al agregar monto:', error);
      setError(error.response?.data?.error || 'Error al agregar el monto');
    }
  };

  const handleRetirarMonto = async () => {
    if (!cajaActual) return;
    
    try {
      await axios.put(`/api/caja/${cajaActual.id_caja}/retirar`, movimientoForm);
      fetchData();
      setOpenRetirarDialog(false);
      setMovimientoForm({ monto: 0, concepto: '' });
    } catch (error: any) {
      console.error('Error al retirar monto:', error);
      setError(error.response?.data?.error || 'Error al retirar el monto');
    }
  };

  const calcularSaldoActual = () => {
    if (!cajaActual) return 0;
    
    // Usar el saldo calculado por el backend que incluye las ventas
    if (cajaActual.saldo_actual !== undefined) {
      return cajaActual.saldo_actual;
    }
    
    // Fallback al cálculo manual si no viene del backend
    const totalIngresos = movimientos
      .filter(m => m.tipo_movimiento === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const totalEgresos = movimientos
      .filter(m => m.tipo_movimiento === 'egreso' || m.tipo_movimiento === 'retiro')
      .reduce((sum, m) => sum + m.monto, 0);
    
    return cajaActual.monto_inicial + totalIngresos - totalEgresos;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE');
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
            🏦 Control de Caja
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra la apertura, cierre y reportes de caja
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
          
          {!cajaActual ? (
            <Button
              variant="contained"
              startIcon={<LockOpenIcon />}
              onClick={() => setOpenAbrirDialog(true)}
              sx={{ bgcolor: '#4caf50' }}
            >
              Abrir Caja
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenAgregarDialog(true)}
                color="success"
              >
                Agregar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => setOpenRetirarDialog(true)}
                color="warning"
              >
                Retirar
              </Button>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                onClick={() => setOpenCerrarDialog(true)}
                sx={{ bgcolor: '#f44336' }}
              >
                Cerrar Caja
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Estado actual de la caja */}
      {cajaActual && (
        <Card sx={{ mb: 4, bgcolor: '#e8f5e8' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" color="success.main" fontWeight={600}>
                      Caja Abierta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Abierta por: {cajaActual.nombre_usuario} {cajaActual.apellido_usuario}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Desde: {formatDateTime(cajaActual.fecha_apertura)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          {formatCurrency(cajaActual.monto_inicial)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monto Inicial
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="success.main" fontWeight={600}>
                          {formatCurrency(calcularSaldoActual())}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Saldo Actual
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
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {cajas.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Cajas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {cajas.filter(c => c.estado === 'abierta').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cajas Abiertas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {cajas.filter(c => c.estado === 'cerrada').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cajas Cerradas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(cajaActual?.total_ventas_finalizadas || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas de Sesión
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {cajaActual?.total_ventas || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transacciones
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

      {/* Tabla de cajas */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Historial de Cajas
          </Typography>

          {cajas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <AccountBalanceIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay cajas registradas
              </Typography>
              <Typography variant="body2">
                Comienza abriendo la primera caja del sistema.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Monto Inicial</TableCell>
                      <TableCell>Monto Final</TableCell>
                      <TableCell>Total Ventas</TableCell>
                      <TableCell>Total Retiros</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Fecha Apertura</TableCell>
                      <TableCell>Fecha Cierre</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cajas.map((caja) => (
                      <TableRow key={caja.id_caja} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{caja.id_caja}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={caja.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                            color={caja.estado === 'abierta' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(caja.monto_inicial)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {caja.monto_final ? (
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(caja.monto_final)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {caja.estado === 'abierta' ? (
                            <Typography variant="body2" color="success.main">
                              {formatCurrency(caja.total_ventas_finalizadas || 0)}
                            </Typography>
                          ) : caja.total_ventas ? (
                            <Typography variant="body2" color="success.main">
                              {formatCurrency(caja.total_ventas)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {caja.total_retiros ? (
                            <Typography variant="body2" color="error.main">
                              {formatCurrency(caja.total_retiros)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {caja.nombre_usuario} {caja.apellido_usuario}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(caja.fecha_apertura)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {caja.fecha_cierre ? (
                            <Typography variant="body2">
                              {formatDateTime(caja.fecha_cierre)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver movimientos">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  // Implementar vista de movimientos
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
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
                count={cajas.length}
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

      {/* Dialog para abrir caja */}
      <Dialog open={openAbrirDialog} onClose={() => setOpenAbrirDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockOpenIcon color="success" />
            Abrir Caja
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto Inicial *"
              type="number"
              value={abrirForm.monto_inicial}
              onChange={(e) => setAbrirForm({ ...abrirForm, monto_inicial: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Observaciones"
              value={abrirForm.observaciones}
              onChange={(e) => setAbrirForm({ ...abrirForm, observaciones: e.target.value })}
              multiline
              rows={3}
              placeholder="Observaciones sobre la apertura de caja..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAbrirDialog(false)}>Cancelar</Button>
          <Button onClick={handleAbrirCaja} variant="contained" color="success">
            Abrir Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cerrar caja */}
      <Dialog open={openCerrarDialog} onClose={() => setOpenCerrarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="error" />
            Cerrar Caja
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Saldo actual: <strong>{formatCurrency(calcularSaldoActual())}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="Monto Final en Caja *"
              type="number"
              value={cerrarForm.monto_final}
              onChange={(e) => setCerrarForm({ ...cerrarForm, monto_final: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Observaciones"
              value={cerrarForm.observaciones}
              onChange={(e) => setCerrarForm({ ...cerrarForm, observaciones: e.target.value })}
              multiline
              rows={3}
              placeholder="Observaciones sobre el cierre de caja..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCerrarDialog(false)}>Cancelar</Button>
          <Button onClick={handleCerrarCaja} variant="contained" color="error">
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar monto */}
      <Dialog open={openAgregarDialog} onClose={() => setOpenAgregarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="success" />
            Agregar Monto a Caja
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto *"
              type="number"
              value={movimientoForm.monto}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Concepto *"
              value={movimientoForm.concepto}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, concepto: e.target.value })}
              required
              placeholder="Descripción del ingreso..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgregarDialog(false)}>Cancelar</Button>
          <Button onClick={handleAgregarMonto} variant="contained" color="success">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para retirar monto */}
      <Dialog open={openRetirarDialog} onClose={() => setOpenRetirarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RemoveIcon color="warning" />
            Retirar Monto de Caja
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Saldo disponible: <strong>{formatCurrency(calcularSaldoActual())}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="Monto *"
              type="number"
              value={movimientoForm.monto}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0.01, max: calcularSaldoActual(), step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Concepto *"
              value={movimientoForm.concepto}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, concepto: e.target.value })}
              required
              placeholder="Descripción del retiro..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRetirarDialog(false)}>Cancelar</Button>
          <Button onClick={handleRetirarMonto} variant="contained" color="warning">
            Retirar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Caja;
