/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Control_BD;


import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;
import BD_Configuracion.modConfiguracion;
/**
 *
 * @author RICHARD
 */
public class Control_Configuracion {
       DefaultTableModel modelo;
    //vector con los titulos de cada columna

    //matriz donde se almacena los datos de cada celda de la tabla

    // Conectar Base de Datos
    ConexionConBaseDatos conectar = new ConexionConBaseDatos();
    
    
       Connection conexion = null;
    Statement sentencia = null;
    ResultSet resultado = null;
    PreparedStatement ps = null;
    int impuesto;
    String moneda;
    String simbolo_moneda;
    String nombre_empresa;
        String direccion;
        String ruc;
        String celular;
    String dimension_y;
    String dimension_x;
       int contador=0;
String cantidad_ceros_boleta;
String cantidad_ceros_factura;

    public void ejecutarConsultaTodaTabla() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ORDER BY nombre_empresa ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
      modConfiguracion.jTextField_Nombre_empresa.setText(resultado.getString("nombre_empresa")) ;

           modConfiguracion.jTextField_impuesto.setText(resultado.getString("impuesto")) ;
              modConfiguracion.jTextField_moneda.setText(resultado.getString("moneda")) ;
               modConfiguracion.jTextField_simbolo_moneda.setText(resultado.getString("simbolo_moneda")) ;
modConfiguracion.jTextField_direccion.setText(resultado.getString("direccion")) ;
modConfiguracion.jTextField_ruc.setText(resultado.getString("ruc")) ;
modConfiguracion.jTextField_celular.setText(resultado.getString("celular")) ;
modConfiguracion.jTextField_dimension_x.setText(resultado.getString("dimension_x")) ;
modConfiguracion.jTextField_dimension_y.setText(resultado.getString("dimension_y")) ;
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


     
     
     
         public void ModificarConfiguracion(String nombre_empresa,int impuesto,String moneda,String simbolo_moneda,String direccion,String ruc	,String celular, String dimension_x, String dimension_y) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
      
            Statement comando = reg.createStatement();

            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_configuracion set nombre_empresa ='" + nombre_empresa + "' ," +"impuesto ='" + impuesto + "' ," +"moneda ='" + moneda + "' ,"+"simbolo_moneda ='" + simbolo_moneda + "' ,"+"direccion ='" + direccion + "'  ,"+"ruc ='" + ruc + "' ,"+"celular ='" + celular + "' ,"+"dimension_x ='" + dimension_x + "' ,"+"dimension_y ='" + dimension_y + "' " );
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"Tiene que haber una dato registrado en la tabla configuracion ");
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
        
    }//cierra metodo modificarCliente
         ///
         
/////
         //
         ///
         //
             
                      public void resetear_configuracion_cantidadceros() {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
    String cantidad_ceros_factura="000000000"; 
      
            Statement comando = reg.createStatement();

           
            // linea de codigo de mysql que actualiza regristos que va modificar
        
            
            int cantidad = comando.executeUpdate("update table_configuracion set cantidad_ceros_factura ='" + cantidad_ceros_factura + "' " );
 int cantidad2 = comando.executeUpdate("update table_configuracion set cantidad_ceros_boleta ='" + cantidad_ceros_factura + "' " );           
        
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
        
    }
         ///
         //
         //
         //
         
         //
         
                      public void actualizar_cantidad_Ceros_factura(int numero_factura) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
    String cantidad_ceros_factura=""; 
       String estado_ceros="no"; 
            Statement comando = reg.createStatement();
if(numero_factura==10){
cantidad_ceros_factura="00000000";
estado_ceros="yes";
}
if(numero_factura==100){
cantidad_ceros_factura="0000000";
estado_ceros="yes";
}
if(numero_factura==1000){
cantidad_ceros_factura="000000";
estado_ceros="yes";
}
if(numero_factura==10000){
cantidad_ceros_factura="00000";
estado_ceros="yes";
}
if(numero_factura==100000){
cantidad_ceros_factura="0000";
estado_ceros="yes";
}
if(numero_factura==1000000){
cantidad_ceros_factura="000";
estado_ceros="yes";
}
if(numero_factura==10000000){
cantidad_ceros_factura="00";
estado_ceros="yes";
}
if(numero_factura==100000000){
cantidad_ceros_factura="0";
estado_ceros="yes";
}
if(numero_factura==1000000000){
cantidad_ceros_factura="";
estado_ceros="yes";
}
            // linea de codigo de mysql que actualiza regristos que va modificar
        if(estado_ceros=="yes"){
            
            int cantidad = comando.executeUpdate("update table_configuracion set cantidad_ceros_factura ='" + cantidad_ceros_factura + "' " );
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"Tiene que haber una dato registrado en la tabla configuracion ");
            }
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
        
    }
         
         
         ///
         public void actualizar_cantidad_Ceros_boleta(int numero_boleta) {

    
        try {
               Connection reg = ConexionConBaseDatos.getConexion();
            //Connection conexion = DriverManager.getConnection("jdbc:mysql://localhost/sysultimate_2022", "root", "");
    String cantidad_ceros_boleta=""; 
       String estado_ceros="no"; 
            Statement comando = reg.createStatement();
if(numero_boleta==10){
cantidad_ceros_boleta="00000000";
estado_ceros="yes";
}
if(numero_boleta==100){
cantidad_ceros_boleta="0000000";
estado_ceros="yes";
}
if(numero_boleta==1000){
cantidad_ceros_boleta="000000";
estado_ceros="yes";
}
if(numero_boleta==10000){
cantidad_ceros_boleta="00000";
estado_ceros="yes";
}
if(numero_boleta==100000){
cantidad_ceros_boleta="0000";
estado_ceros="yes";
}
if(numero_boleta==1000000){
cantidad_ceros_boleta="000";
estado_ceros="yes";
}
if(numero_boleta==10000000){
cantidad_ceros_boleta="00";
estado_ceros="yes";
}
if(numero_boleta==100000000){
cantidad_ceros_boleta="0";
estado_ceros="yes";
}
if(numero_boleta==1000000000){
cantidad_ceros_boleta="";
estado_ceros="yes";
}
            // linea de codigo de mysql que actualiza regristos que va modificar
        if(estado_ceros=="yes"){
            
            int cantidad = comando.executeUpdate("update table_configuracion set cantidad_ceros_boleta ='" + cantidad_ceros_boleta + "' " );
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
                JOptionPane.showMessageDialog(null,"Tiene que haber una dato registrado en la tabla configuracion ");
            }
            }
            reg.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
        
    }
                 public void Cargarconfiguracion() {

    
 

        ejecutarConsultaTodaTabla();

    }  
                 
        
                     
          public int getimpuesto() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          impuesto=(resultado.getInt("impuesto")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return impuesto;
    }
          
             public int getnumero_boleta() {
           
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_facturas where factura_boleta='boleta'";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
//   contador++;

          contador=(resultado.getInt("nro_boleta")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return contador;
    }
             
             ///
                          public int getnumero_factura() {
           
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_facturas where factura_boleta='factura'";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
//   contador++;

          contador=(resultado.getInt("nro_boleta")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return contador;
    }
             
             //
             public String getcantidad_ceros_factura() {
           
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
//   contador++;

          cantidad_ceros_factura=(resultado.getString("cantidad_ceros_factura")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return cantidad_ceros_factura;
    }          
             
             ///
             public String getcantidad_ceros_boleta() {
           
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
//   contador++;

          cantidad_ceros_boleta=(resultado.getString("cantidad_ceros_boleta")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return cantidad_ceros_boleta;
    }

             //

     public String getmoneda() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          moneda=(resultado.getString("moneda")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return moneda;
    }
     
     
     
     
     
     
     
     
           public String getdireccion() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          direccion=(resultado.getString("direccion")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return direccion;
    }
     
           
                      public String getruc() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          ruc=(resultado.getString("ruc")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return ruc;
    }
                      
                      
                         public String getcelular() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          celular=(resultado.getString("celular")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return celular;
    }              
     
        public String getsimbolo_moneda() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          simbolo_moneda=(resultado.getString("simbolo_moneda")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return simbolo_moneda;
    }
        
        
           public String getnombre_empresa() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          nombre_empresa=(resultado.getString("nombre_empresa")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return nombre_empresa;
    }
           
           
           
           //
              
           public String getdimension_x() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          dimension_x=(resultado.getString("dimension_x")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return dimension_x;
    }
           
                 public String getdimension_y() {
              
        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_configuracion ";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {
   

          dimension_y=(resultado.getString("dimension_y")) ;
              

            }//cierra while (porque no hay mas datos en la BD)


        } catch (SQLException e) {
            JOptionPane.showMessageDialog(null,"Error SQL:\n" + e);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,e);
            conexion = null;
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
        return dimension_y;
    }
}
