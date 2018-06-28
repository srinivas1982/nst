// read led status and take  action
// read uart data and take action

var b = require('bonescript');
child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var currentLoadValue =require ('./nestlay_freezermonitor.js'); // From MSP

var fs = require("fs");
var content = fs.readFileSync("settings.json");
var jsonContent = JSON.parse(content);

var skuWeightDat=[50,50,50,50,50]; // each icream weight from cloud
var lastLoadAverage=[2500,2500,2350,4400,1250];
var finalloadAvegare;

b.pinMode('P8_12', b.INPUT);   // read DOOR STATUS ( 0 -Lock ,1-Unlock )
b.pinMode('P8_16', b.OUTPUT);


emitter.on('StartOperationMode', function(arg1) { 

        console.log(arg1);
	
	if(arg1.toString() === "Start")   // Operation mode start purchase ice cream
	{
	   //console.log(" Start@");

	   // open the door 
	   b.digitalWrite('P8_16', 1);  // unlock the door
	   IcecreamInventryUpdate();
	   // start Shopping mode
	   // update Inventory	

	}
	else if( arg1.toString() === "Stop" )
	{
	   //console.log(" Stop@ ");
	   // update Inventory
           b.digitalWrite('P8_16', 0);  // lock the door
	   IcecreamInventryUpdate();
	   
	}
	else
	{
	 console.log(" error @ ");
	// error
	}
});




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



//setInterval(printDoorStatus,2000);

function readuart4()
{
	emitter.on('uart-data', function(arg1) { // load cell values from MSP
        console.log(arg1);
        console.log(" Read uart4 data");
});
}


//fs.writeFileSync('./settings.json', arg1);  


function IcecreamInventryUpdate() {
var B1,B2,B3,B4,B5; // purchases icecream

var basketObj = {
              B1: [],
              B2:[],
              B3:[],
              B4:[],
              B5:[]
   };

	//console.log(skuWeightDat[0]);
	 B1= (lastLoadAverage[0]-currentLoadValue[0] )/skuWeightDat[0];
         //console.log(B1);
	
	 B2 = (lastLoadAverage[1]-currentLoadValue[1])/skuWeightDat[1];
        //console.log(B2);

	 B3= (lastLoadAverage[2]-currentLoadValue[2] )/skuWeightDat[2];
        //console.log(B3);

	 B4 = (lastLoadAverage[3]-currentLoadValue[3] )/skuWeightDat[3];
        //console.log(B4);


	 B5 = (lastLoadAverage[4]-currentLoadValue[4] )/skuWeightDat[4];
        //console.log(B5);

	/* calculated  icecream and update
	 inventoryUpdated with paylods(Purchase ice creams ,Name, and price) */

	basketObj.B1.push({count:B1,name:"venila",price:"2$"});
   	basketObj.B2.push({count:B2,name:"strawberry",price:"4$"});
   	basketObj.B3.push({count:B3,name:"choclate",price:"10$"});
   	basketObj.B4.push({count:B4,name:"mixednuts",price:"23$"});
   	basketObj.B5.push({count:B5,name:"coneicecreams",price:"21$"});
   
	var json = JSON.stringify(basketObj);
   	console.log(json);
   	basketObj = JSON.parse(json);
   
   
   	//console.log(basketObj.B1[0].count,basketObj.B1[0].name,basketObj.B1[0].price);
   	//console.log(basketObj.B2[0].count,basketObj.B2[0].name,basketObj.B2[0].price);
   	//console.log(basketObj.B3[0].count,basketObj.B3[0].name,basketObj.B3[0].price);
   	//console.log(basketObj.B4[0].count,basketObj.B4[0].name,basketObj.B4[0].price);
   	//console.log(basketObj.B5[0].count,basketObj.B5[0].name,basketObj.B5[0].price);


        emitter.emit('inventoryUpdated',basketObj);
        
}


//setTimeout(readuart4, 1000);



/**
*  UIStart event
*  Sends current state to UI
*/
/*
events.on (constants.event.UIStart, function ()
{
        log.info ('Got event ' + constants.event.UIStart);
        //if (obstructionTimer !== null)
        //        events.emit (constants.event.operationStep, constants.screen.dispenseWater);
        //else
                events.emit (constants.event.operationStep, constants.screen.idle);
});

*/
















