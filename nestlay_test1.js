// read uart data and take action
// read uart data and take action
// read sensor status and sent the details to userinface

var b = require('bonescript');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

function AddNumbers(a,b){
    return a+b;
}

module.exports.AddNumbers = AddNumbers;



function add(x,y){
    console.log(" add function ");
    return x+y;
}


//setInterval(readsonsor, 1000);
setInterval(testAmbientTemp, 1200);

/*
module.exports = {
  foo: function () {
    var x=100;
    return (x);	

  },
  bar: function () {
    var y=200;
    return (y);
  }
};
*/



  
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





//function readtestInternalTempSensorData() {
//
//        emitter.emit('testInternalTempSensor',1);
//}


//function readtestDoorSensor1Data() {

//        emitter.emit('testDoorSensor1',1);
//}

//function readtestDoorSensor2Data() {

//      emitter.emit('testDoorSensor2',1);
//}

//function readtestDoorLock1Data() {

  //      emitter.emit('testDoorLock1',1);
//}

//function readtestDoorLock2Data() {

//        emitter.emit('testDoorLock2',1);
//}


//function readtest4gConnectivityData() {

//      emitter.emit('test4gConnectivity',1);
//}



//module.exports = add;

//module.exports = readTestSensorData;
//module.exports = readtestInternalTempSensorData;
//module.exports = readtestDoorSensor1Data;
//module.exports = readtestDoorSensor2Data;
//module.exports = readtestDoorLock1Data;
//module.exports = readtestDoorLock2Data;
//module.exports = readtest4gConnectivityData;


//module.exports = readsensors;

module.exports = testAmbientTemp;
module.exports = testInternalTemp;




