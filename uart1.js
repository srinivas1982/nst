var serialport = require('serialport');
var serialPort = new serialport("/dev/ttyO4", {
  baudRate: 115200,lock:false});

//{"b1":"2400", "b2":"2450","b3":"2300","b4":"2200","b5":"2100","t1":"26.5","t2":"25.5","crc":"xx"};
//{'b1':'2400', 'b2':'2450','b3':'2300','b4':'2200','b5':'2100','t1':'26.5','t2':'25.5','crc':'xx'};

var crc_16;

serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
  console.log(data);

  myJson = {};
  jsonData ={};
  myJson = data.toString('utf8');
  jsonData = JSON.parse(myJson);

  serialPort.write("Hi How are you", function() {
  console.log("writing");

  //console.log(myJson);
  //console.log(jsonData);
  //console.log(jsonData.b1);
        });
  });
});

