// read led status and take  action
// read uart data and take action

child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var fs = require("fs");
var content = fs.readFileSync("settings.json");
var jsonContent = JSON.parse(content);

var tstmode = require ('./nestlay_test1.js');
//var tstmode = require ('./add.js');


	if(jsonContent.machineMode == 'operationMode')
	{
	        console.log(jsonContent.machineMode );
		emitter.emit('machineMode',jsonContent.machineMode);
		
		emitter.on('led-status', function(arg1) { 
		if ( arg1==1) {
			console.log("led is on");
		}
		else{
        		console.log("led is off");
		}
		});
	
		emitter.on('uart-data', function(arg2) {
	              console.log(arg2);

                });	         	
	}	
	else if (jsonContent.machineMode == 'testMode')
	{
                console.log("testMode@");
	//	console.log(adder1(1,2));
	//      console.log(adder2(11,11));
			
		var var1;
		var1 = tstmode.fun1();
		console.log(var1);
	
 	//	tstmode.readtestInternalTempSensorData;
	//	tstmode.readtestDoorSensor1Data;
	//	tstmode.readtestDoorSensor2Data;
	//	tstmode.readtestDoorLock1Data;
	//	tstmode.readtestDoorLock2Data;
	//	tstmode.readtest4gConnectivityData;
	
	}

//setInterval(copyInputToOutput, 1000);




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
















