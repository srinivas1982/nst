'use strict';

var log = require ('./log-system');

var spawn = require('child_process').spawnSync;

var reloadScript = function(){
	var process = spawn('python',['cellular.py']);
	var o = JSON.parse(process.stdout.toString());
	next = o.next;
	log.info('Cellular.js script offered the following object ' + o.toString());
	return o; 
};

var next = 30;

module.exports = {reload : reloadScript, next: next};

