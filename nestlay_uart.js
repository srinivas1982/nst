// read the uart data from MSP and export to other file
var serialport = require('serialport');
var serialPort = new serialport("/dev/ttyO4", {
  baudRate: 115200,lock:false});

//uart data format #2500,2400,2300,2200,1250,xxxx;

serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
  //console.log(data);

  myUartData = data.toString('utf8');
 
  serialPort.write("Hi How are you", function() {
  console.log("writing");

  console.log(myUartData);
  var fields = myUartData.split(',');

  //console.log(fields[0]); // prtint 0 to 5

    var i=fields[0].length;
    console.log(i);
    fields[0]= fields[0].slice(1,i);   
    //console.log(fields[0]);
    

    var i=fields[5].length; // remove ';' from field
    //console.log(i);    
    
    fields[5]=fields[5].slice(0,(i-1));
    //console.log(fields[5]);

        });
  });
});

exports.fields;


