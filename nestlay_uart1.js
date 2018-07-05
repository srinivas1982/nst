// read the uart data from MSP and export to other file
var serialport = require('serialport');
var serialPort = new serialport("/dev/ttyO4", {
  baudRate: 115200,lock:false});
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();
var firstarray ="";
var secondarray ="";
var count=0;
serialPort.on("open", function () {
  console.log('uart4 open ok');
  serialPort.on('data', function(data) {
  myUartData = data.toString('utf8');
  count ++;
    var i;
    i = myUartData[0].length;
    myUartData[0]= myUartData[0].slice(1,i); // remove the '#'

    i = myUartData[5].length; // remove ';' from field
    myUartData[5]=myUartData[5].slice(0,(i-1));
   
    emitter.on('startOperationMode',function(arg1){
        console.log(arg1);
    if( (arg1.toString() !== "Start")&&((arg1.toString() !== "Stop") ) ) // Operation mode start
      {  
       count = 1;
     }
     else{
     count = 0;
     }

       if(count )
       {
          firstarray = myUartData; 
          console.log("1st arr");
          console.log(firstarray);
       }
       else
       {
         secondarray = myUartData;
         console.log("2nd arr");
	 console.log(secondarray);

       }
  console.log("writing");
  serialPort.write("Hi How are you");
});
  //serialPort.write("Hi How are you", function() {
  //console.log("writing");
});

});
