import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalParking,
  People,
  Receipt,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface DashboardStats {
  totalEspacios: number;
  espaciosLibres: number;
  espaciosOcupados: number;
  totalClientes: number;
  totalVentas: number;
  ingresosHoy: number;
  ingresosMes: number;
}

interface EspacioOcupado {
  id_espacio: number;
  numero_espacio: string;
  tipo_vehiculo: string;
  placa_vehiculo: string;
  minutos_estacionado: number;
  monto_actual: number;
  Nombre_Cliente?: string;
  Apellido_Cliente?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [espaciosOcupados, setEspaciosOcupados] = useState<EspacioOcupado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas de espacios
      const [espaciosResponse, clientesResponse, ventasResponse, ingresosResponse] = await Promise.all([
        axios.get('/api/espacios/estadisticas/overview'),
        axios.get('/api/clientes'),
        axios.get('/api/ventas/estadisticas/overview'),
        axios.get('/api/ventas/ingresos/hoy')
      ]);

      const espaciosStats = espaciosResponse.data.data;
      const clientesData = clientesResponse.data.data;
      const ventasStats = ventasResponse.data.data;
      const ingresosHoy = ingresosResponse.data.data.total;

      // Obtener espacios ocupados
      const espaciosOcupadosResponse = await axios.get('/api/espacios/ocupados');
      const espaciosOcupadosData = espaciosOcupadosResponse.data.data;

      // Calcular estadísticas del dashboard
      const dashboardStats: DashboardStats = {
        totalEspacios: espaciosStats.total_espacios || 0,
        espaciosLibres: espaciosStats.espacios_libres || 0,
        espaciosOcupados: espaciosStats.espacios_ocupados || 0,
        totalClientes: clientesData.length || 0,
        totalVentas: ventasStats.total_ventas || 0,
        ingresosHoy: ingresosHoy || 0,
        ingresosMes: 0 // Se puede implementar después
      };

      setStats(dashboardStats);
      setEspaciosOcupados(espaciosOcupadosData);
    } catch (error: any) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <IconButton size="small" onClick={fetchDashboardData} sx={{ ml: 1 }}>
          <Refresh />
        </IconButton>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header del Dashboard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
          🚗 Dashboard - Sistema POS Parqueamiento
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, {user?.nombre} {user?.apellido}. Aquí tienes un resumen del estado actual del sistema.
        </Typography>
      </Box>

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total de Espacios */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalParking sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div">
                {stats?.totalEspacios || 0}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Total de Espacios
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Espacios Libres */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#4caf50' }}>
                {stats?.espaciosLibres || 0}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Espacios Libres
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Espacios Ocupados */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#f44336' }}>
                {stats?.espaciosOcupados || 0}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Espacios Ocupados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total de Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#ff9800' }}>
                {stats?.totalClientes || 0}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Total de Clientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Segunda fila de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total de Ventas */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#9c27b0' }}>
                {stats?.totalVentas || 0}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Total de Ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingresos de Hoy */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#4caf50' }}>
                {formatCurrency(stats?.ingresosHoy || 0)}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Ingresos de Hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingresos del Mes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography className="dashboard-stat" variant="h3" component="div" sx={{ color: '#2196f3' }}>
                {formatCurrency(stats?.ingresosMes || 0)}
              </Typography>
              <Typography className="dashboard-label" variant="body2">
                Ingresos del Mes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Espacios Ocupados */}
      <Card className="dashboard-card">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ color: '#1976d2', fontWeight: 600 }}>
              🚗 Espacios Ocupados Actualmente
            </Typography>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={fetchDashboardData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {espaciosOcupados.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <LocalParking sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay espacios ocupados
              </Typography>
              <Typography variant="body2">
                Todos los espacios están disponibles en este momento.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} className="table-container">
              <Table>
                <TableHead className="table-header">
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Espacio</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vehículo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tiempo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {espaciosOcupados.map((espacio) => (
                    <TableRow key={espacio.id_espacio} hover>
                      <TableCell>
                        <Chip 
                          label={espacio.numero_espacio} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={espacio.tipo_vehiculo} 
                          color="secondary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {espacio.placa_vehiculo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {espacio.Nombre_Cliente ? `${espacio.Nombre_Cliente} ${espacio.Apellido_Cliente || ''}` : 'Sin cliente'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(espacio.minutos_estacionado)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(espacio.monto_actual)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
