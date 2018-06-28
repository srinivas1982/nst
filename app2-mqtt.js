// app2.js read the led status an output displayed on console
var EventEmitter = require('redis-events').EventEmitter;

var emitter = new EventEmitter();
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://broker.hivemq.com')

if (emitter.setMaxListeners) {
emitter.setMaxListeners(11);
}

emitter.on('led-status', function(arg1) {
        
	if ( arg1==1) {
        console.log("led is on");
        }
        else{
        console.log("led is off");
        } 
	
	client.on('connect', function () {
    	lient.subscribe('led-status')
	})
	
});


client.on('message', function (topic, message) {
	context = message.toString();
	console.log(context)
})


