// read uart data and take action

var b = require('bonescript');
child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var lastCount = require ('./nestlay_uart.js'); // read from uart4.js
var fs = require("fs");
var content = fs.readFileSync("settings.json");
var jsonContent = JSON.parse(content);
var skuWeightDat=[50,50,50,50,50]; // each icream weight from cloud

b.pinMode('P8_12', b.INPUT);   // read DOOR STATUS ( 1 - open ,0 - close )
b.pinMode('P8_16', b.OUTPUT);  // led 

//setInterval(IcecreamInventryUpdateStart,2000);

emitter.on('startOperationMode',function(arg1){

        console.log(arg1);
	
	if(arg1.toString() === "Start") // Operation mode start
	{
	   //console.log(" Start@");

	   // open the door 
	   b.digitalRead('P8_12', writeToOutput);
    		function writeToOutput(x) {
        	b.digitalWrite('P8_16', x.value);
	        }
	   
	   emitter.emit('lockStatus',"Unlock"); // UI unlock the door
           //emitter.emit('doorStatus',1); // UI 1- open the door
	  				
	//   IcecreamInventryUpdateStart();

var basketObj1 = require ('./nestlay_uart.js'); // read from uart4.js
//var  jsonObj1 = JSON.stringify(basketObj1);
//console.log(jsonObj1);
  console.log(basketObj1);
  
   // start Shopping mode
   // update Inventory	

	}
	else if( arg1.toString() === "Stop" )
	{
	   //console.log(" Stop@ ");
	   // update Inventory
          emitter.emit('doorStatus',"Lock"); // display UI msg doorlocked pls c
     	  emitter.emit('lockStatus',1); // UI unlock the door

	   b.digitalWrite('P8_16', 0);  // lock the door
	
           //IcecreamInventryUpdateEnd();

var basketObj2 = require ('./nestlay_uart.js'); //read latest data from uart
//var  jsonObj2 = JSON.stringify(basketObj2);
//console.log(jsonObj2);
//   console.log(basketObj2);	   
// console.log(" difference ");
  var obj3 =( basketObj1-basketObj2);   
   console.log(obj3);	
     }
	else
	{
	 console.log(" error @ ");
	// error
	}
});


function IcecreamInventryUpdateStart() {
//var basketObj1 = require ('./nestlay_uart.js'); // read from uart4.js
//var  jsonObj1 = JSON.stringify(basketObj1);
//     console.log(jsonObj1);
}

function IcecreamInventryUpdateEnd() {
//var basketObj2 = require ('./nestlay_uart.js'); // read from uart4.js
//var  jsonObj2 = JSON.stringify(basketObj2);
//     console.log(jsonObj2);
}


function printDoorStatus() {

    b.digitalRead('P8_12', writeToOutput);
 
	function writeToOutput(x) {
        	b.digitalWrite('P8_16', x.value);  // unlock door
        
		if (x.value == 1)
		{
	        console.log(" Door Un Lock and value = 1 ");
	        emitter.emit('DoorStatus',"Unlock");
		//IcecreamInventryUpdate();
		}
		else
		{
	        console.log(" Door Lock and value = 0 ");
                emitter.emit('DoorStatus',"Lock");
		//IcecreamInventryUpdate();
		}

   	 }
}

















