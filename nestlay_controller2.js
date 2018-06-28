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


var testmode = require('./nestlay_test1.js');

var skuWeightDat=[50,50,50,50,50]; // each icream weight from cloud
var lastLoadAverage =require ('./nestlay_uart.js'); // //read from uart4.js
var finalloadAvegare;

//setTimeout(icecream_calc, 1000);
//setInterval( testAmbientTemp,1200);





function machinemode_check() {

	//console.log(jsonContent.machineMode);

	if(jsonContent.machineMode == 'operationMode')
	{
	        console.log(jsonContent.machineMode );
		//emitter.emit('machineMode',jsonContent.machineMode);
		emitter.emit('startEvent',jsonContent.machineMode);
	
		// Load Lock Screen  need to trigger event to userinterface ?
		// Start uart.js to start receiving data from the MSP
		// Start mqtt.js to start cloud communication -x
		// Start hive.js - x
		// Start freezerMonitor.js -
      	
	}	
	else if (jsonContent.machineMode == 'testMode')
	{
                console.log("testMode#");
		//testmode.testAmbientTemp;
		//testmode.testInternalTemp;

		//readtestDoorSensor1Data();
		//readtestDoorSensor2Data();
		//readtestDoorLock1Data();
		//readtestDoorLock2Data();
		//readtest4gConnectivityData();

	}
        else if (jsonContent.machineMode == 'setupMode')
	{

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
















