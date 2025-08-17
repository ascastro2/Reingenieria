/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package Control_BD;


import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;

/**
 *
 * @author richard
 */
public class fusuario {
    
        Connection cn = null;
 //   private ConexionConBaseDatos mysql = new conexion();

    private String sSQL = "";
    private String sSQL2 = "";
    public Integer totalregistros;

    public DefaultTableModel mostrar_inicial() {
        cn= ConexionConBaseDatos.getConexion();
        
        DefaultTableModel modelo;

        String[] titulos = {"id", "usuario", "pasword", "tipo", "nombres", "apellidos", "dni", "Teléfono"};

        String[] registro = new String[14];

        totalregistros = 0;
        modelo = new DefaultTableModel(null, titulos);

        sSQL = "select p.id,p.usuario,p.pasword,p.tipo,p.nombres,p.apellidos,"
                + "p.dni,p.telefono from usuario p";

        try {
            Statement st = cn.createStatement();
            ResultSet rs = st.executeQuery(sSQL);

            while (rs.next()) {
                registro[0] = rs.getString("id");
                registro[1] = rs.getString("usuario");
                registro[2] = rs.getString("pasword");
                registro[3] = rs.getString("tipo");
                registro[4] = rs.getString("nombres");
                registro[5] = rs.getString("apellidos");
                registro[6] = rs.getString("dni");
                registro[7] = rs.getString("telefono");

                
                totalregistros = totalregistros + 1;
                modelo.addRow(registro);

            }
            return modelo;

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return null;
        }

    }
    public DefaultTableModel mostrar(String buscar) {
        cn= ConexionConBaseDatos.getConexion();
        DefaultTableModel modelo;

        String[] titulos = {"id", "usuario", "pasword", "tipo", "nombres", "apellidos", "dni", "Teléfono"};

        String[] registro = new String[14];

        totalregistros = 0;
        modelo = new DefaultTableModel(null, titulos);

        sSQL = "select p.id,p.usuario,p.pasword,p.tipo,p.nombres,p.apellidos,"
                + "p.dni,p.telefono from usuario p"
                + " where dni like '%"
                + buscar + "%' or "
                +"nombres like '%"
                + buscar + "%' or "
                +"apellidos like '%"
                + buscar + "%'"
                + "order by id desc";

        try {
            Statement st = cn.createStatement();
            ResultSet rs = st.executeQuery(sSQL);

            while (rs.next()) {
                registro[0] = rs.getString("id");
                registro[1] = rs.getString("usuario");
                registro[2] = rs.getString("pasword");
                registro[3] = rs.getString("tipo");
                registro[4] = rs.getString("nombres");
                registro[5] = rs.getString("apellidos");
                registro[6] = rs.getString("dni");
                registro[7] = rs.getString("telefono");

                
                totalregistros = totalregistros + 1;
                modelo.addRow(registro);

            }
            return modelo;

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return null;
        }

    }

    public boolean insertar(vusuario dts) {
        cn= ConexionConBaseDatos.getConexion();
       sSQL = "insert into usuario (id,usuario,pasword,tipo,nombres,apellidos,dni,telefono)"
                + "values (?,?,?,?,?,?,?,?)";
   //     sSQL2 = "insert into usuario (id,usuario,pasword,tipo,nombres,apellidos,dni,telefono)"
     //           + "values (?,?,?,?,?,?,?,?)";
        try {
                
            PreparedStatement pst = cn.prepareStatement(sSQL);
            //PreparedStatement pst2 = cn.prepareStatement(sSQL2);

     
            pst.setString(1, "");
            pst.setString(2, dts.getUsuario());
            pst.setString(3, dts.getPassword());
            pst.setString(4, dts.getTipo());
            pst.setString(5, dts.getNombres());
            pst.setString(6, dts.getApellidos());
            pst.setInt(7, dts.getdni());
            pst.setInt(8, dts.getTelefono()); 

        
            
                  int n2 = pst.executeUpdate();

                if (n2 != 0) {
                    return true;

                } else {
                    return false;
                }

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return false;
        }
    }

    public boolean editar(vusuario dts) {
        cn= ConexionConBaseDatos.getConexion();
//consultar editar usuario
        
        sSQL2 = "update usuario set id=?,usuario=?,pasword=?,tipo=?,nombres=?,apellidos=?,dni=?,telefono=?"
                + " where id=?";
        try {

            PreparedStatement pst = cn.prepareStatement(sSQL2);

   

               pst.setString(1, dts.getUsuario());
            pst.setString(2, dts.getPassword());
            pst.setString(3, dts.getTipo());
            pst.setString(4, dts.getTipo());
            pst.setString(5, dts.getNombres());
            pst.setString(6, dts.getApellidos());
            pst.setInt(7, dts.getdni());
            pst.setInt(8, dts.getTelefono()); 

               int n2 = pst.executeUpdate();

                if (n2 != 0) {
                    return true;

                } else {
                    return false;
                }
         

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return false;
        }
    }

    public boolean eliminar(vusuario dts) {
        cn= ConexionConBaseDatos.getConexion();
//consulta eliminar usuario
                
          sSQL="delete from usuario where id=?";
       
       try {
           
           PreparedStatement pst=cn.prepareStatement(sSQL);
           
           pst.setInt(1, dts.getId());

               int n2 = pst.executeUpdate();

                if (n2 != 0) {
                    return true;

                } else {
                    return false;
                }
         

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return false;
        }
    }
    public DefaultTableModel login(String usuario,String pasword) {
        cn= ConexionConBaseDatos.getConexion();
        DefaultTableModel modelo;

        String[] titulos = {"id", "usuario", "pasword", "tipo", "nombres", "apellidos", "dni", "telefono"};

        String[] registro = new String[8];

        totalregistros = 0;
        modelo = new DefaultTableModel(null, titulos);

        sSQL = "select p.id,p.usuario,p.pasword,p.tipo,"
                + "p.nombres,p.apellidos,p.dni,p.telefono from usuario p "
                + " where p.usuario='"
                + usuario + "' and p.pasword='" + pasword + "'";

        try {
            Statement st = cn.createStatement();
            ResultSet rs = st.executeQuery(sSQL);

            while (rs.next()) {
                registro[0] = rs.getString("id");
                registro[1] = rs.getString("usuario");
                registro[2] = rs.getString("pasword");
                registro[3] = rs.getString("tipo");
                
                registro[4] = rs.getString("nombres");
                registro[5] = rs.getString("apellidos");
                registro[6] = rs.getString("dni");
                registro[7] = rs.getString("telefono");
                
                totalregistros = totalregistros + 1;
                modelo.addRow(registro);

            }
            return modelo;

        } catch (Exception e) {
            JOptionPane.showConfirmDialog(null, e);
            return null;
        }

    }
    
}
