/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Control_BD;


import BD_Usuario.ModificarUsuario;
import BD_Usuario.ModificarPassword;
import BD_Usuario.addUsuario;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;

/**
 *
 * @author RICHARD
 */
public class Control_Usuario {
            DefaultTableModel modelo;
    //vector con los titulos de cada columna
    String[] titulosColumnas = {"ID","USUARIO","TIPO","NOMBRES","APELLIDOS","DNI","TELEFONO"};
    //matriz donde se almacena los datos de cada celda de la tabla
    String info[][] = {};
    // Conectar Base de Datos
    ConexionConBaseDatos conectar = new ConexionConBaseDatos();
    
    
       Connection conexion = null;
    Statement sentencia = null;
    ResultSet resultado = null;
    PreparedStatement ps = null;

    public void ejecutarConsultaTodaTabla() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM usuario ORDER BY usuario ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


                int codigo = resultado.getInt("id");
                String usuario = resultado.getString("usuario");
              
                String tipo = resultado.getString("tipo");
                String nombres = resultado.getString("nombres");
                String apellidos = resultado.getString("apellidos");
                String dni = resultado.getString("dni");
                String telefono = resultado.getString("telefono");
    
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, usuario,tipo,nombres,apellidos,dni,telefono};

                //al modelo de la tabla le agrega una fila
                //con los datos que están en info
                modelo.addRow(info);

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }

    }//cierra metodo ejecutarConsulta
     public void agregarUsuario(String usuario,String pasword,String tipo,String nombres,String apellidos,String dni,String telefono) {

         Connection reg = ConexionConBaseDatos.getConexion();
        
         String sql = "INSERT INTO usuario ( id, usuario,pasword,tipo,nombres,apellidos,dni,telefono)VALUES (?,?,?,?,?,?,?,?)";
            try {
            
            PreparedStatement pst= reg.prepareStatement(sql);
            pst.setString(1,"");
            pst.setString(2,usuario);
             pst.setString(3,pasword);
             pst.setString(4,tipo);
             pst.setString(5,nombres);
             pst.setString(6,apellidos);
             pst.setString(7,dni);
             pst.setString(8,telefono);
  
            int n = pst.executeUpdate();
            if (n>0){
                JOptionPane.showMessageDialog(null,"Regristado Exitosamente de usuario");
            }

        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null,"Error - "+ex);
            Logger.getLogger(addUsuario.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
     
     
     
         public void Modificarusuario(String code,String usuario,String nombres,String apellidos,String dni,String telefono) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update usuario set usuario ='" + usuario + "',nombres ='" + nombres + "',apellidos ='" + apellidos + "',dni ='" + dni + "',telefono ='" + telefono + "' " +"where id =" + code);
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"No existe Usuario de un codigo "+code);
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }//cierra metodo modificarCliente
         
         
                  public void Modificarpassword(String code,String pasword) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update usuario set pasword ='" + pasword + "' " +"where id =" + code);
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"No existe Usuario de un codigo "+code);
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }//cierra metodo modificarCliente
         
                 public void CargarModificarUsuario() {

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
                     ModificarUsuario.jTable_usuario.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabla();

    }  
                 
                                 public void CargarModificarpasswordUsuario() {

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
                     ModificarPassword.jTable_usuario.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabla();

    }  
                 
                     public void buscarModificarUsuario(String parametroBusqueda) {

        

            modelo = new DefaultTableModel(info, titulosColumnas) {
                public boolean isCellEditable(int row, int column) {
                    return false;
                }
            };

            ;

            //le asigna el modelo al jtable
                         ModificarUsuario.jTable_usuario.setModel(modelo);
            //ejecuta una consulta a la BD
            buscarRegistronombre(parametroBusqueda);

        

    }
                     
                             public void buscarRegistronombre(String parametroBusqueda) {

        try {

            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;

                selectSQL = "SELECT * FROM usuario WHERE  usuario LIKE ?  ORDER BY id ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");

            resultado = ps.executeQuery();

            while (resultado.next()) {
           
          int codigo = resultado.getInt("id");
                String usuario = resultado.getString("usuario");
                String tipo = resultado.getString("tipo");
                String nombres = resultado.getString("nombres");
                String apellidos = resultado.getString("apellidos");
                String dni = resultado.getString("dni");
                String telefono = resultado.getString("telefono");
            
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, usuario,tipo,nombres,apellidos,dni,telefono};                
 
             
                //al modelo de la tabla le agrega una fila
                //con los datos que están en info
                modelo.addRow(info);

            }

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,"Error\n Por la Causa" + e);
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }


    }
}
