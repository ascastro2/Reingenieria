import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'vendedor' | 'cajero';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Usuario de prueba para desarrollo
  const usuarioPrueba: User = {
    id: 1,
    email: 'admin@parqueamiento.com',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: 'admin'
  };

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configurar el token en axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verificar si el token es válido
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      // Token inválido, limpiar localStorage
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Para desarrollo, simular login exitoso
      if (email === 'admin@parqueamiento.com' && password === 'admin123') {
        // Simular token
        const token = 'token_prueba_' + Date.now();
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(usuarioPrueba);
        return;
      }

      // En producción, usar la API real
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar token en axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Actualizar estado del usuario
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error en el inicio de sesión');
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si es necesario
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
