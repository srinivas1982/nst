// app1.js  read P8_12 status and output on P8_16 (led)

var b = require('bonescript');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();

b.pinMode('P8_12', b.INPUT);
b.pinMode('P8_16', b.OUTPUT);

setInterval(copyInputToOutput, 1000);

function copyInputToOutput() {
    b.digitalRead('P8_12', writeToOutput);
    function writeToOutput(x) {
        b.digitalWrite('P8_16', x.value);
        emitter.emit('led-status',x.value);

    }
}

