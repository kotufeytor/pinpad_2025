const { SerialPort } = require('serialport');

// Configura el puerto serie
const port = new SerialPort({
    path: 'COM12',       // Cambia esto al puerto correcto
    baudRate: 19200,     // Velocidad de transmisión
  });
 // Y19D6D2AFD1C7AFCC77A5C2A887FB85BD32AB8927CB1446FA15E86619F651FA187C9D72DFA51F7D12543515F74EE218C0E505160218E51454534AEBD12093B488963F60AFE44599F73F29D771493A6BE232BE83CA1AEC3FAD4F3C98BB26BA57428FA305ADAA7DE4C4F3E2F2947DF39FA1893C1E6841816F76E40028A7620C8FB7F5∟010001∟060001N<FS>0000000101000000000000000008
//Y01C869C085B18EA03C29582FA3F4C5FA908FC876C235C73FF5656B2AA8BFC788FB5991F4912169F89055E641E330DEBFD3920CEAB51FC5B672<CR><LF>F1566645541A59C325414BF645F47D07E5F16163E88F4D1C33D333E064871AA0619F0AF4862108D2<CR><LF>6A36AD970AD3C7DFF4312D0BF6E92938396856011E47E1A451CED155BBBA5407<FS>010001<FS>030j
//const buf = Buffer.from('Y0I#');
const buf = Buffer.from('Y19D6D2AFD1C7AFCC77A5C2A887FB85BD32AB8927CB1446FA15E86619F651FA187C9D72DFA51F7D12543515F74EE218C0E505160218E51454534AEBD12093B488963F60AFE44599F73F29D771493A6BE232BE83CA1AEC3FAD4F3C98BB26BA57428FA305ADAA7DE4C4F3E2F2947DF39FA1893C1E6841816F76E40028A7620C8FB7F5\x1C010001\x1C060001N\x1C0000000101000000000000000008');
console.log(buf);

// Función para enviar un mensaje y esperar una respuesta con timeout
function sendWithTimeout(message, timeout, responseTimeout = 800) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      let responseTimeoutId;
      let receivedData = ''; // Acumulador de datos recibidos
  
      // Escuchar datos recibidos
      const dataListener = (data) => {
        receivedData += data.toString(); // Acumular los datos recibidos
  
        // Retrasar la ejecución de port.off para dar tiempo a recibir todo el paquete
        clearTimeout(responseTimeoutId); // Limpiar el timeout anterior
        responseTimeoutId = setTimeout(() =>{ 
          port.off('data', dataListener); // Dejar de escuchar más datos
          resolve(receivedData.trim()); // Resolver la promesa con los datos recibidos
        }, responseTimeout); // Esperar un tiempo adicional después del último dato recibido
      };
  
      // Configurar el timeout principal
      timeoutId = setTimeout(() => {
        port.off('data', dataListener); // Dejar de escuchar más datos
        reject(new Error('Timeout: No se recibió respuesta')); // Rechazar la promesa
      }, timeout);
  
      // Escuchar datos
      port.on('data', dataListener);
  
      // Enviar el mensaje
      port.write(message, (err) => {
        if (err) {
          clearTimeout(timeoutId); // Cancelar el timeout si hay un error al escribir
          port.off('data', dataListener); // Dejar de escuchar más datos
          reject(err); // Rechazar la promesa con el error
        }
      });
    });
  }
  
  // Ejemplo de uso
  sendWithTimeout( buf, 2000, 1000) // Enviar mensaje, timeout de 2 segundos, y 500 ms adicionales para recibir datos
    .then((response) => {
        // let bufRespuesta = response.toString('uft8');
      console.log('Respuesta recibida:', response);
    })
    .catch((err) => {
      console.error('Error:', err.message);
    });