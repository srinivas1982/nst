// read led status and take  action
// read uart data and take action

var $= require ('jquery');
var b= require ('bonescript');
var child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var currentLoadValue =require ('./nestlay_freezermonitor.js');

var fs = require("fs");
var content = fs.readFileSync("settings.json");
var jsonContent = JSON.parse(content);

var skuWeightDat=[50,50,50,50,50]; // each icream weight from cloud
//var lastLoadAverage=[2500,2500,2350,4400,1250]; // read from uart4.js
var finalloadAvegare;

setTimeout(icecream_calc, 1000);
setInterval(machinemode_check, 1000);
//setInterval( testAmbientTemp,1200);


//var sensordata = require('./nestlay_test1.js');
//x =sensordata.testAmbientTemp;
//console.log(x);


function icecream_calc() {
var B1,B2,B3,B4,B5; // purchases icecream

	//console.log(skuWeightDat[0]);
	 B1= (lastLoadAverage[0]-currentLoadValue[0] )/skuWeightDat[0];
         console.log(B1);
	
	 B2 = (lastLoadAverage[1]-currentLoadValue[1])/skuWeightDat[1];
        console.log(B2);

	 B3= (lastLoadAverage[2]-currentLoadValue[2] )/skuWeightDat[2];
        console.log(B3);

	 B4 = (lastLoadAverage[3]-currentLoadValue[3] )/skuWeightDat[3];
        console.log(B4);


	 B5 = (lastLoadAverage[4]-currentLoadValue[4] )/skuWeightDat[4];
        console.log(B5);

	// calculated  icecream and update
	// inventoryUpdated with paylods(Purchase ice creams ,Name, and price)
        
}

function machinemode_check() {

	//console.log(jsonContent.machineMode);

	if(jsonContent.machineMode == 'operationMode')
	{
	        console.log(jsonContent.machineMode );
		emitter.emit('machineMode',jsonContent.machineMode);
		
		//emitter.on('led-status', function(arg1) { 
		//if ( arg1==1) {
		//	console.log("led is on");
		//}
		//else{
        	//	console.log("led is off");
	       //	}
	       //	});
	
		emitter.on('uart-data', function(arg2) {
	              console.log(arg2);

                });	   
	
		// Load Lock Screen  need to trigger event to userinterface ?
		// Start uart.js to start receiving data from the MSP
		// Start mqtt.js to start cloud communication -x
		// Start hive.js - x
		// Start freezerMonitor.js -
      	
	}	
	else if (jsonContent.machineMode == 'testMode')
	{
                console.log("testMode#");
		//sensordata.testAmbientTemp;
		testAmbientTemp();
		testInternalTemp();

                //emitter.emit('testAmbientTempSensor',22.5);
		//readtestInternalTempSensorData();
		//readtestDoorSensor1Data();
		//readtestDoorSensor2Data();
		//readtestDoorLock1Data();
		//readtestDoorLock2Data();
		//readtest4gConnectivityData();

	}

}



function testAmbientTemp()
{

var current_amb_temp=22;
var min_amb_temp = process.env.MIN_AMBIENT_TEMP;
var max_amb_temp = process.env.MAX_AMBIENT_TEMP;

        console.log("current_amb_temp =",current_amb_temp);
        console.log("min_amb_temp",min_amb_temp);
        console.log("max_amb_temp",max_amb_temp);

        if ( current_amb_temp >= min_amb_temp  && current_amb_temp <= max_amb_temp)
        {

                console.log("AMB temp TRUE");
                emitter.emit('testAmbientTempSensor',1);

        }
        else
        {
                console.log("AMB temp FALSE");
                emitter.emit('testAmbientTempSensor',0);

        }

}




function testInternalTemp()
{

var current_internal_temp = 22;
var min_internal_temp = process.env.MIN_INTERNAL_TEMP;
var max_internal_temp = process.env.MAX_INTERNAL_TEMP;

        console.log("current_internal_temp =",current_internal_temp);
        console.log("min_internal_temp=",min_internal_temp);
        console.log("max_internal_temp=",max_internal_temp);

        if ( current_internal_temp >= min_internal_temp  && current_internal_temp <= max_internal_temp)
        {

                console.log(" Internal Temp True ");
                emitter.emit('testInternalTempSensortestInternalTempSensor',1);

        }
        else
        {
                console.log(" Internal Temp False ");
                emitter.emit('testInternalTempSensor',0);

        }

}




//setInterval(copyInputToOutput, 1000);


function readtestAmbientTempSensorData() {
        
	emitter.emit('testAmbientTempSensor',1);
}

function readtestInternalTempSensorData() {

        emitter.emit('testInternalTempSensor',1);
}


function readtestDoorSensor1Data() {

        emitter.emit('testDoorSensor1',1);
}

function readtestDoorSensor2Data() {

        emitter.emit('testDoorSensor2',1);
}

function readtestDoorLock1Data() {

        emitter.emit('testDoorLock1',1);
}

function readtestDoorLock2Data() {

        emitter.emit('testDoorLock2',1);
}


function readtest4gConnectivityData() {

        emitter.emit('test4gConnectivity',1);
}


/**
*  Setup of uart pins if necessary
*/

//if (!process.env.SKIP_SETUP_SERIAL)
if(1)
{
	//console.log(JSON.stringify(settings));
        try
        {
                child_process.execSync ('bash  uart-en.sh');
        }
        catch (e)
        {
                setTimeout (function ()
                {
                        process.exit (-1);
                }, 1000);
                log.error ('Serial Port setup failed '+e);
        }
}


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
















