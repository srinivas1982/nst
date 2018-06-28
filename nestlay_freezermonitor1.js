// nestlay_freezermonitor.js
// read uart data , save last three values and compare witg (TH)threshold values  not implemted TH and last three records
// if values are abobe or below (TH) values reject

child_process = require ('child_process');
require('dotenv').config();
var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

var skuWeightDat=[50,50,50,50,50]; // each icream weight from cloud
var currentLoadValue = [2400,2500,2300,3900,1150];
var lastLoadAverage =require ('./nestlay_uart.js'); // //read from uart4.js
var finalloadAvegare;



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


module.exports =currentLoadValue;













