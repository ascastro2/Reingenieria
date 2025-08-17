/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package parqueamiento;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 *
 * @author RICHARD
 */
public class NewMain {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        // TODO code application logic here
        
         try {
            /* - Datos de acceso a nuestra base de datos */
            /* Usa localhost si el servidor corre en la misma maquina, de lo 
            contrario utiliza la IP o dirección del sevidor*/
            String dbServer = "localhost";
            /* El usuario de tu base de datos*/
            String dbName = "sysultimate_2022";
            /* El usuario de tu base de datos*/
            String dbUser = "root";
            /* La contraseña de la base de datos (dejarla en texto plano puede 
            ser un problema)*/
            String dbPass = "";
            
            /*El nombre o ruta a donde se guardara el archivo de volcado .sql*/
            String sqlFile = "backups\respaldo.sql";
 
            /* La linea de comando completa que ejecutara el programa*/
            String command = "bin/mysqldump --host " + dbServer + " -u " + dbUser
                    + " -p" + dbPass + " " + dbName + " -r " + sqlFile;
 
            /*Se crea un proceso que ejecuta el comando dado*/
            Process bck = Runtime.getRuntime().exec(command);
            
            /* Obtiene el flujo de datos del proceso, esto se hace para obtener 
            el texto del proceso*/
            InputStream stdout = bck.getErrorStream();
            
            /* Se obtiene el resultado de finalizacion del proceso*/
            int resultado = bck.waitFor();
            
            String line;
 
            /* Se crea un buffer de lectura con el flujo de datos outstd y ese mismo
            sera leido e impreso, esto mostrara el texto que muestre el programa
            mysqldump, de esta forma sabra cual es el error en su comando*/
            BufferedReader brCleanUp
                    = new BufferedReader(new InputStreamReader(stdout));
            while ((line = brCleanUp.readLine()) != null) {
                System.out.println(line);
            }
            brCleanUp.close();
 
            if (resultado == 0) {
                System.out.println("Respaldo exitoso");
            } else {
                System.out.println("Error al respaldar");
            }
        } catch (IOException | InterruptedException ex) {
            System.out.println("Exception: " + ex.getMessage());
        }
    }
    
}
