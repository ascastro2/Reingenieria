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
  TablePagination,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'cajero';
  estado: 'activo' | 'inactivo';
  fecha_creacion: string;
  ultimo_acceso?: string;
}

interface UsuarioForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'admin' | 'vendedor' | 'cajero';
}

interface PasswordForm {
  password_actual: string;
  password_nuevo: string;
  password_confirmar: string;
}

const Usuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<UsuarioForm>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'vendedor'
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    password_actual: '',
    password_nuevo: '',
    password_confirmar: ''
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data.data);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        password: '', // No mostrar contraseña actual
        rol: usuario.rol
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'vendedor'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUsuario(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'vendedor'
    });
  };

  const handleOpenPasswordDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setPasswordForm({
      password_actual: '',
      password_nuevo: '',
      password_confirmar: ''
    });
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setSelectedUsuario(null);
    setPasswordForm({
      password_actual: '',
      password_nuevo: '',
      password_confirmar: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingUsuario) {
        // Para edición, solo enviar password si se proporcionó uno nuevo
        const updateData = { ...formData };
        if (!updateData.password) {
          const { password, ...updateDataWithoutPassword } = updateData;
          await axios.put(`/api/usuarios/${editingUsuario.id_usuario}`, updateDataWithoutPassword);
        } else {
          await axios.put(`/api/usuarios/${editingUsuario.id_usuario}`, updateData);
        }
      } else {
        await axios.post('/api/usuarios', formData);
      }
      
      fetchUsuarios();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      setError(error.response?.data?.error || 'Error al guardar el usuario');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.password_nuevo !== passwordForm.password_confirmar) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      if (passwordForm.password_nuevo.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      await axios.put(`/api/usuarios/${selectedUsuario?.id_usuario}/password`, {
        password_actual: passwordForm.password_actual,
        password_nuevo: passwordForm.password_nuevo
      });

      handleClosePasswordDialog();
      setError(null);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await axios.delete(`/api/usuarios/${id}`);
        fetchUsuarios();
      } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        setError(error.response?.data?.error || 'Error al eliminar el usuario');
      }
    }
  };

  const handleToggleEstado = async (usuario: Usuario) => {
    try {
      const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
      await axios.put(`/api/usuarios/${usuario.id_usuario}/estado`, { estado: nuevoEstado });
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      setError(error.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsuarios = filteredUsuarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'error';
      case 'vendedor':
        return 'primary';
      case 'cajero':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'cajero':
        return 'Cajero';
      default:
        return rol;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Nunca';
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
            👥 Gestión de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema y sus permisos
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsuarios}
          >
            Actualizar
          </Button>
          
          {currentUser?.rol === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#1976d2' }}
            >
              Nuevo Usuario
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
                {usuarios.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Usuarios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {usuarios.filter(u => u.estado === 'activo').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {usuarios.filter(u => u.rol === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administradores
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {usuarios.filter(u => u.estado === 'inactivo').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Inactivos
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
                placeholder="Buscar por nombre, apellido, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Typography variant="body2" color="text.secondary">
                {filteredUsuarios.length} de {usuarios.length} usuarios
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Lista de Usuarios
          </Typography>

          {paginatedUsuarios.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <PersonIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No hay usuarios registrados
              </Typography>
              <Typography variant="body2">
                Comienza agregando el primer usuario del sistema.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Último Acceso</TableCell>
                      <TableCell>Fecha Creación</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsuarios.map((usuario) => (
                      <TableRow key={usuario.id_usuario} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{usuario.id_usuario}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {usuario.nombre} {usuario.apellido}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {usuario.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRolLabel(usuario.rol)}
                            color={getRolColor(usuario.rol) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            color={usuario.estado === 'activo' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {usuario.ultimo_acceso ? formatDateTime(usuario.ultimo_acceso) : 'Nunca'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(usuario.fecha_creacion)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {currentUser?.rol === 'admin' && (
                              <>
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenDialog(usuario)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Cambiar contraseña">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleOpenPasswordDialog(usuario)}
                                  >
                                    <LockIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                                  <IconButton
                                    size="small"
                                    color={usuario.estado === 'activo' ? 'error' : 'success'}
                                    onClick={() => handleToggleEstado(usuario)}
                                  >
                                    <Switch
                                      checked={usuario.estado === 'activo'}
                                      size="small"
                                      onChange={() => handleToggleEstado(usuario)}
                                    />
                                  </IconButton>
                                </Tooltip>
                                
                                {usuario.id_usuario !== currentUser?.id && (
                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(usuario.id_usuario)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
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
                count={filteredUsuarios.length}
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

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingUsuario ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                >
                  <MenuItem value="vendedor">Vendedor</MenuItem>
                  <MenuItem value="cajero">Cajero</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingUsuario ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña *'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUsuario}
                helperText={editingUsuario ? 'Deja en blanco para mantener la contraseña actual' : 'Mínimo 6 caracteres'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1976d2' }}>
            {editingUsuario ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="warning" />
            Cambiar Contraseña - {selectedUsuario?.nombre} {selectedUsuario?.apellido}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña Actual *"
                type="password"
                value={passwordForm.password_actual}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_actual: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nueva Contraseña *"
                type="password"
                value={passwordForm.password_nuevo}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_nuevo: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña *"
                type="password"
                value={passwordForm.password_confirmar}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmar: e.target.value })}
                required
                error={passwordForm.password_nuevo !== passwordForm.password_confirmar && passwordForm.password_confirmar !== ''}
                helperText={passwordForm.password_nuevo !== passwordForm.password_confirmar && passwordForm.password_confirmar !== '' ? 'Las contraseñas no coinciden' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
          <Button onClick={handleChangePassword} variant="contained" color="warning">
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
