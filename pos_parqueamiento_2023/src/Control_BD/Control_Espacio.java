/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Control_BD;

import BD_Esspacio.Liberar_espacio;
import BD_Esspacio.Modificar_Espacio;
import BD_Esspacio.addEspacio;


import Control_BD.CerrarConexiones;
import Control_BD.ConexionConBaseDatos;
import parqueamiento.Ventas;

import java.sql.Connection;
import java.sql.DriverManager;
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

public class Control_Espacio {
        DefaultTableModel modelo;
    //vector con los titulos de cada columna
    String[] titulosColumnas = {"ID","ZONA"};
    //matriz donde se almacena los datos de cada celda de la tabla
    String info[][] = {};
    // Conectar Base de Datos
    ConexionConBaseDatos conectar = new ConexionConBaseDatos();
    
    
       Connection conexion = null;
    Statement sentencia = null;
    ResultSet resultado = null;
    PreparedStatement ps = null;

    
    
    
            public void ejecutarConsultaTodaTabla_espacio_ocupadas() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_espacio  WHERE estado='ocupado'";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


                int codigo = resultado.getInt("id_espacio");
                String zona = resultado.getString("zona");
    
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, zona};

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

    }
        public void ejecutarConsultaTodaTabla_espacio_libres() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_espacio  WHERE estado='desocupado'";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


                int codigo = resultado.getInt("id_espacio");
                String zona = resultado.getString("zona");
    
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, zona};

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
    
    public void ejecutarConsultaTodaTabla() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_espacio ORDER BY id_espacio ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


                int codigo = resultado.getInt("id_espacio");
                String zona = resultado.getString("zona");
    
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, zona};

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
     public void agregarEspacio(String zona) {

         Connection reg = ConexionConBaseDatos.getConexion();
        
         String sql = "INSERT INTO table_espacio ( id_espacio, zona, estado)VALUES (?,?,?)";
            try {
            
            PreparedStatement pst= reg.prepareStatement(sql);
            pst.setString(1,"");
            pst.setString(2,zona);
  pst.setString(3,"desocupado");
            int n = pst.executeUpdate();
            if (n>0){
                JOptionPane.showMessageDialog(null,"Regristado Exitosamente espacio");
            }

        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null,"Error - "+ex);
            Logger.getLogger(addEspacio.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
     
              public void cambiara_estado_ocupado(String code) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_espacio set estado ='ocupado' " +"where id_espacio =" + code);
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"No existe espacio "+code);
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }
                   public void cambiara_estado_desocupado(String code) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_espacio set estado ='desocupado' " +"where id_espacio =" + code);
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"No existe espacio "+code);
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }
         public void ModificarEspacio(String code,String zona) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_espacio set zona ='" + zona + "' " +"where id_espacio =" + code);
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"No existe espacio "+code);
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }//cierra metodo modificarCliente
         
                 public void CargarModificarEspacio() {

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
                     Modificar_Espacio.jTable_espacio.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabla();

    }  
                 
                                  public void CargarEspacio_Ocupadas() {

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
                                      Liberar_espacio.jTable_espacio.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabla_espacio_ocupadas();

    } 
                 
                     public void buscarModificarEspacio(String parametroBusqueda) {

        

            modelo = new DefaultTableModel(info, titulosColumnas) {
                public boolean isCellEditable(int row, int column) {
                    return false;
                }
            };

            ;

            //le asigna el modelo al jtable
            Modificar_Espacio.jTable_espacio.setModel(modelo);
            //ejecuta una consulta a la BD
            buscarRegistronombre(parametroBusqueda);

        

    }
                     
                           public void CargarEspacioLibresVentas(){
         
         modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
             Ventas.Seleccionar_mesas.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabla_espacio_libres();
        
                               /*              int[] anchos = {35, 300, 40, 200, 40};
        for (int i = 0; i < Ventas.SeleccionarProductos.getColumnCount(); i++) {
            Ventas.SeleccionarProductos.getColumnModel().getColumn(i).setPreferredWidth(anchos[i]);}
         */
     }
                     
                             public void buscarRegistronombre(String parametroBusqueda) {

        try {

            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;

                selectSQL = "SELECT * FROM table_espacio WHERE  zona LIKE ?  ORDER BY id_espacio ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");

            resultado = ps.executeQuery();

            while (resultado.next()) {
           
          int codigo = resultado.getInt("id_espacio");
                String zona = resultado.getString("zona");
            
                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {codigo, zona};                
 
             
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
