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
import javax.swing.JOptionPane;

/**
 *
 * @author RICHARD
 */
public class vaciar_base_de_datos {
        ConexionConBaseDatos conectar = new ConexionConBaseDatos();
    
    
       Connection conexion = null;
    Statement sentencia = null;
    ResultSet resultado = null;
    PreparedStatement ps = null;
    public void EliminarProveedor() {
/*
        try {            
     Connection conexion = ConexionConBaseDatos.getConexion();
            Statement comando = conexion.createStatement();
            int cantidad = comando.executeUpdate("delete from table_proveedor where id_proveedor=" + code);
            if (cantidad == 1) {
   
                JOptionPane.showMessageDialog(null,"Eliminado");
            } else {
                JOptionPane.showMessageDialog(null,"No existe Proveedor de Codigo "+code);
            }
            conexion.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null,"error "+ex);
        }
*/
    }


    public void Eliminar_db() {

        try {            
     Connection conexion = ConexionConBaseDatos.getConexion();
            Statement comando = conexion.createStatement();
           int cantidad  =    comando.executeUpdate("delete from table_facturas" );

    int cantidad3  =   comando.executeUpdate("delete from table_cajas" );   

int cantidad4  = comando.executeUpdate("delete from table_espacio" ); 
   
int cantidad7  = comando.executeUpdate("delete from table_cliente" );   
  





            conexion.close();
            Control_Configuracion c=new Control_Configuracion();
            c.resetear_configuracion_cantidadceros();
            
              JOptionPane.showMessageDialog(null,"la base de datos se vacio con exito");
            
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null,"error "+ex);
        }

    }    
}
