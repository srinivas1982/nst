var serialport = require('serialport');
var serialPort = new serialport("/dev/ttyO4", {
  baudRate: 115200,lock:false});

//var result ="Abced1234";

serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
    console.log(data);

  serialPort.write("Hi How are you", function() {
  console.log("writing");
	});
  });
});


