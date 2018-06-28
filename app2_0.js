// app2.js read the led status an output displayed on console
var EventEmitter = require('redis-events').EventEmitter;

var emitter = new EventEmitter();

function readuart4()
{
emitter.on('uart-data', function(arg1) { // read
	console.log(arg1);
        console.log(" Test msg ");
});
}

setTimeout(readuart4, 1000);

