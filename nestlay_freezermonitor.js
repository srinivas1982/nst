// nestlay_freezermonitor.js
// read uart data , save last three values and compare witg (TH)threshold values
// if values are abobe or below (TH) values reject


child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var currentLoadValue = [2400,2500,2300,3900,1150];
// read load cell values from MSP on UART 4

function readuart4()
{
emitter.on('uart-data', function(arg1) { 
        console.log(arg1);
        console.log(" Test msg ");
});
}

// need to write into on the settings.json

// setTimeout(readuart4, 1000);



module.exports =currentLoadValue;













