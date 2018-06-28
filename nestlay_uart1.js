// read uart data send to  nestlay_controller.js
// read P8_12 status and output on P8_16 (led) send 

var b = require('bonescript');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;


var data1 ="India";

b.pinMode('P8_12', b.INPUT);
b.pinMode('P8_16', b.OUTPUT);

setInterval(copyInputToOutput, 1000);

function copyInputToOutput() {
    b.digitalRead('P8_12', writeToOutput);
    function writeToOutput(x) {
        b.digitalWrite('P8_16', x.value);
        emitter.emit('led-status',x.value);
	emitter.emit('uart-data',"India");

   }
}


var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\n")
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
  console.log(data);

  
  });
});


