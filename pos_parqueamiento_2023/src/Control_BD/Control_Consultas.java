package Control_BD;

import BD_Cliente.ListarCliente;
import BD_Usuario.addUsuario;

import consultas.ConsultarFacturas;
import static consultas.ConsultarFacturas.jTableListarFacturas;
import static consultas.ConsultarFacturas.listadecompras;



import parqueamiento.Lista_cajas;
import parqueamiento.Ventas;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;

/**
 * En esta clase se exponen todos los métodos para ejercer control sobre los
 * datos que van desde y hacia la tabla clientes. En esta clase se hace la
 * validación y organizacion de los datos.
 *
 * @author Sergio
 */


public class Control_Consultas {

    //modelo para la tabla
    DefaultTableModel modelo;
    //vector con los titulos de cada columna
    
    //matriz donde se almacena los datos de cada celda de la tabla
    String info[][] = {};
    // Conectar Base de Datos
    ConexionConBaseDatos conectar = new ConexionConBaseDatos();
    
    
    

     
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

        
        
            public void listarcajas() {
        
        String[] titulosColumnas = { "FECHA", "MONTO","ESTADO"};

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
                Lista_cajas.jTablecajas.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTablacajas();

    }
    public void listarTodosFacturas() {
        
        String[] titulosColumnas = {"No_Facturas", "CLIENTE", "RAZÓN SOCIAL", "FECHA APERTURA","TOTAL"};

        modelo = new DefaultTableModel(info, titulosColumnas) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
      //le asigna el modelo al jtable
        ConsultarFacturas.jTableListarFacturas.setModel(modelo);

        //ejecuta una consulta a la BD
        ejecutarConsultaTodaTabladeFacturas();

    }//cierra metodo listarTodosFacturas
    
        

     /**
     * Metodo para consultar todos los regsitros de la base de datos de clientes
     * y luego ser mostrados en una tabla.
     */
    Connection conexion = null;
    Statement sentencia = null;
    ResultSet resultado = null;
    PreparedStatement ps = null;









    public void ejecutarConsultaTodaTablacajas() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_cajas  ORDER BY fecha  ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {



                String fecha = resultado.getString("fecha");
       
                String monto = resultado.getString("monto");
                String estado = resultado.getString("estado");



                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fecha,monto,estado};

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
    
    
    public void ejecutarConsultaTodaTabladeFacturasCompras() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_facturas_compras  ORDER BY fecha_compras  ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


             int fact = resultado.getInt("No_Facturas_Compras");
           
       
                String fecha = resultado.getString("fecha_compras");
                String total = resultado.getString("totals_compras");



                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fact,fecha,total};

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

    public void ejecutarConsultaTodaTabladeFacturas() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_Facturas f inner join  table_Cliente c on f.cliente=c.idCliente ORDER BY fecha ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


             int fact = resultado.getInt("No_Facturas");
                String cliente = resultado.getString("c.Nombre_Cliente")+resultado.getString("c.Apellido_Cliente");
                String razons = resultado.getString("c.razon_s_Cliente");
                String fecha = resultado.getString("fecha");
                String total = resultado.getString("totals");



                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fact,cliente,razons,fecha,total};

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
    
  
    public void buscarFacturas(String parametroBusqueda, boolean buscarPorFacturas, boolean buscarPorCliente, boolean buscarPorFecha) {

        String[] titulosColumnas = {"No_Facturas", "CLIENTE","RAZÓN SOCIAL", "FECHA","TOTAL"};
        if ((parametroBusqueda.trim().length() == 0)) {
            JOptionPane.showMessageDialog(null,"Error, datos incorrectos");
        } else {

            modelo = new DefaultTableModel(info, titulosColumnas) {
                public boolean isCellEditable(int row, int column) {
                    return false;
                }
            };

          

            //le asigna el modelo al jtable
            ConsultarFacturas.jTableListarFacturas.setModel(modelo);
            //ejecuta una consulta a la BD
            buscarFacturasporBusqueda(parametroBusqueda, buscarPorFacturas, buscarPorCliente, buscarPorFecha);

        }

    }//cierra metodo buscarCliente

    /**
     * Método para buscar un registro en la base de datos dentro de la tabla
     * clientes, se puede buscar por la cedula o por el nombre.
     */
     
        
        public void abrircaja(String monto) {
String estado="abierto";

           Calendar fecha = Calendar.getInstance();
            int anio = fecha.get(Calendar.YEAR);
        int mes = fecha.get(Calendar.MONTH);
        int dia = fecha.get(Calendar.DAY_OF_MONTH);
      
String fechaactual=anio+"/"+mes+"/"+dia;
         Connection reg = ConexionConBaseDatos.getConexion();
        
         String sql = "INSERT INTO table_cajas ( id_table_cajas, fecha, monto,estado)VALUES (?,?,?,?)";
            try {
            
            PreparedStatement pst= reg.prepareStatement(sql);
            pst.setString(1,"");
            pst.setString(2,fechaactual);
            pst.setString(3,monto);
            pst.setString(4, estado);
     
            int n = pst.executeUpdate();
            if (n>0){
                JOptionPane.showMessageDialog(null,"Regristado Exitosamente de caja");
            }

        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null,"Error - "+ex);
            Logger.getLogger(addUsuario.class.getName()).log(Level.SEVERE, null, ex);
        }
    } 
        
     
                  public String setmontocaja() {
  String monto="";
        try {

            String parametroBusqueda="abierto";
        
            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;
                 
                System.out.print("buscando por facturas");
                selectSQL = "SELECT * FROM table_cajas WHERE estado LIKE ? ORDER BY id_table_cajas ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            
            
            resultado = ps.executeQuery();

            while (resultado.next()) {
                int id_table_cajas = resultado.getInt("id_table_cajas");
    
                 monto = resultado.getString("monto");
           
         

          
     //   

            }

        } 
        
        catch (Exception e) {
            JOptionPane.showMessageDialog(null,"Error\n Por la Causa" + e);
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
return monto;

    }    
        
                  
                                       public void actualizarcaja(float monto_anterior,float montosumar) {

    
        try {
            float monto=monto_anterior+montosumar;
             conexion = ConexionConBaseDatos.getConexion();
            Statement comando = conexion.createStatement();
            String estado="abierto";
            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_cajas set monto ='" + monto + "'"+ "  where estado='" + estado+"'");
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," caja actualizada con Exito");
                
            } else {
                JOptionPane.showMessageDialog(null,"error estado ");
            }
            conexion.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }
                  
                      public void cerrarcaja() {

    
        try {
             conexion = ConexionConBaseDatos.getConexion();
            Statement comando = conexion.createStatement();
            String estado="cerrado";
            // linea de codigo de mysql que actualiza regristos que va modificar
            int cantidad = comando.executeUpdate("update table_cajas set estado ='" + estado + "'");
            if (cantidad == 1) {
                JOptionPane.showMessageDialog(null," Modifico con Exito");
            } else {
           //     JOptionPane.showMessageDialog(null,"error estado ");
            }
            conexion.close();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null," Error -->"+ex);
        }
    }
                  
                  
        public int buscarestadocaja() {
    int c=0;
        try {

            String parametroBusqueda="abierto";
        
            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;
                 
                System.out.print("buscando por facturas");
                selectSQL = "SELECT * FROM table_cajas WHERE estado LIKE ? ORDER BY id_table_cajas ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            
            
            resultado = ps.executeQuery();

            while (resultado.next()) {
                int id_table_cajas = resultado.getInt("id_table_cajas");
    
                String monto = resultado.getString("monto");
                String fecha = resultado.getString("fecha");
         
c++;
          
     //   

            }

        } 
        
        catch (Exception e) {
            JOptionPane.showMessageDialog(null,"Error\n Por la Causa" + e);
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }
return c;

    }
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
            public void buscarFacturasporBusquedaCompras(String parametroBusqueda, boolean buscarPorFacturas, boolean buscarPorCliente, boolean buscarPorFecha) {

        try {

            
            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;
            if (buscarPorFacturas == true) {     
                System.out.print("buscando por facturas");
                selectSQL = "SELECT * FROM table_facturas_compras WHERE No_facturas_compras LIKE ? ORDER BY fecha_compras ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            } 
    
            else if(buscarPorFecha== true){

                System.out.print("buscando por fecha -->"+parametroBusqueda);
                selectSQL = "SELECT * FROM table_facturas_compras    WHERE fecha_compras LIKE ?  ORDER BY fecha_compras ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            }
            resultado = ps.executeQuery();

            while (resultado.next()) {
                int fact = resultado.getInt("No_facturas_compras");
    
                String fecha = resultado.getString("fecha_compras");
                String total = resultado.getString("totals_compras");
        

                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fact, fecha,total};
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
    public void buscarFacturasporBusqueda(String parametroBusqueda, boolean buscarPorFacturas, boolean buscarPorCliente, boolean buscarPorFecha) {

        try {

            
            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;
            if (buscarPorFacturas == true) {     
                System.out.print("buscando por facturas");
                selectSQL = "SELECT * FROM table_Facturas WHERE No_Facturas LIKE ? ORDER BY fecha ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            } 
            else if(buscarPorCliente== true){
                System.out.print("buscando por cliente");
                selectSQL = "SELECT * FROM table_Facturas f inner join  table_Cliente c on f.cliente=c.idCliente WHERE   c.ruc_Cliente LIKE ? or  c.razon_s_Cliente LIKE ? or c.Nombre_Cliente LIKE ? ORDER BY fecha ASC";
                ps = conexion.prepareStatement(selectSQL);

                 ps.setString(1, "%" + parametroBusqueda + "%");
                  ps.setString(2, "%" + parametroBusqueda + "%");
                        ps.setString(3, "%" + parametroBusqueda + "%");
            }
            else if(buscarPorFecha== true){

                System.out.print("buscando por fecha -->"+parametroBusqueda);
                selectSQL = "SELECT * FROM table_Facturas f inner join  table_Cliente c on f.cliente=c.idCliente WHERE f.fecha LIKE ?  ORDER BY fecha ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + parametroBusqueda + "%");
            }
            resultado = ps.executeQuery();

            while (resultado.next()) {
                int fact = resultado.getInt("No_Facturas");
                String cliente = resultado.getString("c.Nombre_Cliente")+resultado.getString("c.Apellido_Cliente");
                String fecha = resultado.getString("fecha");
                String total = resultado.getString("totals");
                String razons = resultado.getString("razon_s_Cliente");   

                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fact,cliente,razons, fecha,total};
                //al modelo de la tabla le agrega una fila
                //con los datos que están en info
                modelo.addRow(info);

            }

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,"Error\n Por la Causa" + e);
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }


    }//cierra metodo buscarRegistro
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    
    
    //esta es la parte de mostar detalle de facturas por la tabla venta
    
    //metodo para buscar un producto
    public void buscarFacturas ( String number){
        
        String[] titulosColumnas = {"ID-VENTAS", "PRODUCTOS", "CANTIDAD", "IMPORTE"};
        if( (number.trim().length()==0)){
            JOptionPane.showMessageDialog(null,"Error, Seleccione la Facturas");
        }
        else{
            
            modelo = new DefaultTableModel(info,titulosColumnas){
                public boolean isCellEditable(int row, int column)
                {
                return false;
                }
                
            };
         
         
         
        //le asigna el modelo al jtable
       ConsultarFacturas.listadecompras.setModel(modelo);
       
        int[] anchos = {80, 200,50,145};
        for(int i = 0; i < listadecompras.getColumnCount(); i++) {
        listadecompras.getColumnModel().getColumn(i).setPreferredWidth(anchos[i]);
        }
       //ejecuta una consulta a la BD   
        buscarFacturasDetall(number);         
        }
        
    }//cierra metodo buscarCliente
    
      public void buscarFacturasDetall(String number) {

        try {
            conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;
           
                selectSQL = "SELECT * FROM table_ventas WHERE No_Facturas LIKE ? ORDER BY idVentas ASC";
                ps = conexion.prepareStatement(selectSQL);
                ps.setString(1, "%" + number + "%");
            
            resultado = ps.executeQuery();

            while (resultado.next()) {
                String id = resultado.getString("idVentas");
                String product = resultado.getString("productos");
                String cant = resultado.getString("cantidad");
                String imp = resultado.getString("importe");
                //crea un vector donde los está la informacion (se crea una fila)
                
                //buscar producto
                String name="";
                Statement comando = conexion.createStatement();
                 ResultSet registro = comando.executeQuery("select idProductos,nombreProductos from table_productos where idProductos=" +product);
            
                 if (registro.next() == true) {
                     name = registro.getString("nombreProductos");
                    }
            // cierdda de buscar productos
                Object[] info = {id,name,cant,imp};
                //al modelo de la tabla le agrega una fila
                //con los datos que están en info
                modelo.addRow(info);

            }

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null,"Error\n " + e);
        } finally {
            CerrarConexiones.metodoCerrarConexiones(conexion, sentencia, resultado, ps);
        }


    }//cierra metodo buscarRegistro
      
      
      
      // parte de todo consultas en ventas--------------------------------------------------------------
      //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    



//cierra metodo listarTodosFacturas
    
        

     /**
     * Metodo para consultar todos los regsitros de la base de datos de clientes
     * y luego ser mostrados en una tabla.
     */







    
    public void ejecutarConsultaTodaTabladeVentas() {

        try {
            conexion = ConexionConBaseDatos.getConexion();

            sentencia = conexion.createStatement();
            String consultaSQL = "SELECT * FROM table_Facturas f inner join  table_Ventas v on f.No_Facturas=v.No_Facturas inner join  table_Productos p on v.Productos=p.idProductos ORDER BY v.idVentas ASC";
            resultado = sentencia.executeQuery(consultaSQL);


            //mientras haya datos en la BD ejecutar eso...
            while (resultado.next()) {


                int num = resultado.getInt("idVentas");
                String fact = resultado.getString("f.fecha");
                String prod = resultado.getString("p.nombreProductos");
                String cant = resultado.getString("cantidad");
                String importe = resultado.getString("importe");



                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {num,fact,prod,cant,importe};

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
      

            
         

                

                



//cierra metodo buscarCliente
    
    /**
     * Método para buscar un registro en la base de datos dentro de la tabla
     * clientes, se puede buscar por la cedula o por el nombre.
     */

    public void buscarFacturasporBusquedaenVentasFecha(String parametroBusqueda,String parametroBusqueda2) {

        try {

           conexion = ConexionConBaseDatos.getConexion();
            String selectSQL;
            resultado = null;

                System.out.print("buscando por fecha -->"+parametroBusqueda);
                selectSQL = "SELECT * FROM table_Facturas  WHERE " +"  fecha<= '" +parametroBusqueda2+"' AND  fecha>= '"+parametroBusqueda+"'";
               Statement st = conexion.createStatement();
            ResultSet rs = st.executeQuery(selectSQL);
            
             
//float total=0;
float ganancia=0;
//Difererencia
            while (rs.next()) {
             
                int fact = resultado.getInt("No_Facturas");
                String cliente = resultado.getString("Nombre_Cliente")+resultado.getString("Apellido_Cliente");
                String fecha = resultado.getString("fecha");
                String total = resultado.getString("totals");
                String razons = resultado.getString("razon_s_Cliente");   

                //crea un vector donde los está la informacion (se crea una fila)
                Object[] info = {fact,cliente,razons, fecha,total};
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
    
    
    
    
    

    
    
    
 
    
    
    
 
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      
     ////////////
    
     
      
}//cierra class
