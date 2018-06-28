
child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

    emitter.on('machineMode', function(arg1) {
	if(arg1.toString() === "operationMode" ){
       		console.log("operationMode");
     	 }	
      	else{
       		console.log(" test mode or setup mode ");
      }
     });


	emitter.on('testAmbientTempSensor', function(arg1)  {

	 if(arg1 == 1 ){

                console.log("testAmbientTempSensor true");
         }
        else{
               console.log("testAmbientTempSensor false ");
	      }

	});


	emitter.on('testInternalTempSensor', function(arg1)  {

         if(arg1 == 1 ){

                console.log("testInternalTempSensor true");
         }
        else{
               console.log("testInternalTempSensor false ");
            }

        });


	emitter.on('testDoorSensor1', function(arg1)  {

         if(arg1 == 1 ){

                console.log("testDoorSensor 1 true");
         }
        else{
               console.log("testDoorSensor 1 false ");
            }

        });

	
	 emitter.on('testDoorSensor2', function(arg1)  {

         if(arg1 == 1 ){

                console.log("testDoorSensor 2 true");
         }
        else{
               console.log("testDoorSensor 2 false ");
              }

        });


	 emitter.on('testDoorLock1', function(arg1)  {

         if(arg1 == 1 ){

                console.log("testDoorLock 1 true");
         }
        else{
               console.log("testDoorLock 1 false ");
              }

        });


	 emitter.on('testDoorLock2', function(arg1)  {

         if(arg1 == 1 ){

                console.log("testDoorLock 2 true");
         }
        else{
               console.log("testDoorLock 2 false ");
              }

        });


	
	 emitter.on('test4gConnectivity', function(arg1)  {

         if(arg1 == 1 ){

                console.log("test4gConnectivity true");
         }
        else{
               console.log("test4gConnectivity false ");
              }

        });



     

