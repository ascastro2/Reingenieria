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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Cliente {
  idCliente: number;
  Nombre_Cliente: string;
  Apellido_Cliente: string;
  razon_s_Cliente?: string;
  ruc_Cliente?: string;
  direccion_Cliente?: string;
  telefono_Cliente: string;
  correo_Cliente: string;
}

interface ClienteFormData {
  Nombre_Cliente: string;
  Apellido_Cliente: string;
  razon_s_Cliente: string;
  ruc_Cliente: string;
  direccion_Cliente: string;
  telefono_Cliente: string;
  correo_Cliente: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<ClienteFormData>({
    Nombre_Cliente: '',
    Apellido_Cliente: '',
    razon_s_Cliente: '',
    ruc_Cliente: '',
    direccion_Cliente: '',
    telefono_Cliente: '',
    correo_Cliente: ''
  });

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/clientes');
      setClientes(response.data.data);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        Nombre_Cliente: cliente.Nombre_Cliente,
        Apellido_Cliente: cliente.Apellido_Cliente,
        razon_s_Cliente: cliente.razon_s_Cliente || '',
        ruc_Cliente: cliente.ruc_Cliente || '',
        direccion_Cliente: cliente.direccion_Cliente || '',
        telefono_Cliente: cliente.telefono_Cliente,
        correo_Cliente: cliente.correo_Cliente
      });
    } else {
      setEditingCliente(null);
      setFormData({
        Nombre_Cliente: '',
        Apellido_Cliente: '',
        razon_s_Cliente: '',
        ruc_Cliente: '',
        direccion_Cliente: '',
        telefono_Cliente: '',
        correo_Cliente: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCliente(null);
    setFormData({
      Nombre_Cliente: '',
      Apellido_Cliente: '',
      razon_s_Cliente: '',
      ruc_Cliente: '',
      direccion_Cliente: '',
      telefono_Cliente: '',
      correo_Cliente: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCliente) {
        await axios.put(`/api/clientes/${editingCliente.idCliente}`, formData);
      } else {
        await axios.post('/api/clientes', formData);
      }
      fetchClientes();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      setError(error.response?.data?.error || 'Error al guardar el cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await axios.delete(`/api/clientes/${id}`);
        fetchClientes();
      } catch (error: any) {
        console.error('Error al eliminar cliente:', error);
        setError(error.response?.data?.error || 'Error al eliminar el cliente');
      }
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.Nombre_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.Apellido_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.ruc_Cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono_Cliente.includes(searchTerm)
  );

  const paginatedClientes = filteredClientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 600 }}>
          👥 Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#1976d2' }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, apellido, RUC o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchClientes}
                variant="outlined"
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>RUC</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClientes.map((cliente) => (
              <TableRow key={cliente.idCliente}>
                <TableCell>{cliente.Nombre_Cliente}</TableCell>
                <TableCell>{cliente.Apellido_Cliente}</TableCell>
                <TableCell>
                  {cliente.ruc_Cliente ? (
                    <Chip label={cliente.ruc_Cliente} size="small" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin RUC
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{cliente.telefono_Cliente}</TableCell>
                <TableCell>{cliente.correo_Cliente}</TableCell>
                <TableCell>
                  {cliente.direccion_Cliente || (
                    <Typography variant="body2" color="text.secondary">
                      Sin dirección
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(cliente)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cliente.idCliente)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredClientes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.Nombre_Cliente}
                onChange={(e) => setFormData({ ...formData, Nombre_Cliente: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={formData.Apellido_Cliente}
                onChange={(e) => setFormData({ ...formData, Apellido_Cliente: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUC"
                value={formData.ruc_Cliente}
                onChange={(e) => setFormData({ ...formData, ruc_Cliente: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono *"
                value={formData.telefono_Cliente}
                onChange={(e) => setFormData({ ...formData, telefono_Cliente: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.correo_Cliente}
                onChange={(e) => setFormData({ ...formData, correo_Cliente: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razón Social"
                value={formData.razon_s_Cliente}
                onChange={(e) => setFormData({ ...formData, razon_s_Cliente: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.direccion_Cliente}
                onChange={(e) => setFormData({ ...formData, direccion_Cliente: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1976d2' }}>
            {editingCliente ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clientes;
