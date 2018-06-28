'use strict';
var log = require ('./log-system');
var fs = require('fs');
var path = require('path');
var events = require ('./redis-events');
var constants = require ('./ibot-elkay-variables');

var originalTemp = require ('./data-model').originalTemp;
var originalData = require ('./data-model').originalData;
var sharedFunctions = require('./shared-functions');

var data = originalData();
var temp = originalTemp();

var storageFile = path.resolve (process.env.STORAGE_FILE);
var countersFile = path.resolve (process.env.COUNTERS_FILE);

var write = function(){
	
	
	//log.info('----------------------------');
	//TODO am comentat pentru alex log.info(data);
	//log.info('----------------------------');
	if (data.counters.bottleOuncesCounter == 0){
		var emergencyBottleOuncesCounter = 0;
		var flc1 = undefined;
		try{
			flc1 = fs.readFileSync (countersFile, 'utf8');
		}
		catch (e){
			log.info('bottleOuncesCounter was 0, file does not exist');
		}
		if (flc1 != undefined){
			if (flc1 != ''){
				emergencyBottleOuncesCounter = JSON.parse(flc1).bottleOuncesCounter;
				if (emergencyBottleOuncesCounter > data.counters.bottleOuncesCounter){
					data.counters.bottleOuncesCounter = emergencyBottleOuncesCounter;
				}
			}
		}
	}

	if (data.counters.bottles == 0){
		var emergencyBottles = 0;
		var flc2 = undefined;
		try{
			flc2 = fs.readFileSync (countersFile, 'utf8');
		}
		catch (e){
			log.info('bottles was 0, file does not exist');
		}
		if (flc2 != undefined){
			if (flc2 != ''){
				emergencyBottles = JSON.parse(flc2).bottles;
				if (emergencyBottles > data.counters.bottles){
					data.counters.bottles = emergencyBottles;
				}
			}
		}
	}

	writeNoProtection();
	events.emit (constants.event.storagePush, data);
};

var writeTemp = function(){
	events.emit (constants.event.storagePushTemp, temp);
};

var writeNoProtection = function(){
	try
	{
		fs.writeFileSync(storageFile, JSON.stringify(data));
		fs.writeFileSync(countersFile, JSON.stringify(data.counters));
	}
	catch (err){
		log.error ('Could not update storage file (' + storageFile + ') ' + err);
	}
};

var read = function(){
	var fl = undefined;
	try{
		fl = fs.readFileSync (storageFile, 'utf8');
	}
	catch (e){
		if (e.code !== 'ENOENT'){
			throw e;
		}
		else{
			// File doesn't exist
			write();
		}
	}
	if (fl != undefined){
		if (fl == ''){
			write(); 
		}
		else{
			data = JSON.parse(fl);
		}
	}
};


read();

events.on (constants.event.storagePull, function (){
	events.emit (constants.event.storagePush, data);
});

events.on (constants.event.storagePullTemp, function (){
	events.emit (constants.event.storagePushTemp, temp);
});

events.on (constants.event.storageUpdate, function(stringTree, updateData){
	var splitArgs = stringTree.split('.');
	if (splitArgs[0] == 'data' || splitArgs[0] == 'temp'){
		var pointer;
		if (splitArgs[0] == 'data'){
			pointer = data;
		}
		else{
			if (splitArgs[0] == 'temp'){
				pointer = temp;
			}
			else{
				log.error ('Storage update (from UI) wrong first argument (' + stringTree + ') cannot access ' + splitArgs[0]);
			}
		}
		var noError = true;
		for (var i = 1 ; i < splitArgs.length - 1 ; i++) {
			try{
				pointer = pointer[splitArgs[i]];
			}
			catch (e){
				log.error ('Storage update (from UI) wrong first argument (' + stringTree + ') cannot access ' + splitArgs[i] + ' with error ' + e);
				noError = false;
				break;
			}
		}

		if (noError){
			pointer[splitArgs[splitArgs.length - 1]] = updateData;
			log.info('++++++++++++++++++++++++++++');
			log.info(stringTree + ' ' + updateData);
			log.info('++++++++++++++++++++++++++++');
			if (splitArgs[0] == 'data'){
				write();
			}
			else{
				if (splitArgs[0] == 'temp'){
					writeTemp();
				}
				else{
					log.error ('Storage update (from UI) wrong first argument (' + stringTree + ') cannot access ' + splitArgs[0]);
				}
			}
			
		}
		
	}
	else{
		log.error ('Storage update (from UI) wrong first argument (' + stringTree + ') ' + 'should have been \'data_...\' or \'temp_...\'');
	}
});

var factoryReset = function(){
	sharedFunctions.copyObject (module.exports.data, originalData());
	//module.exports.data = originalData ();
	sharedFunctions.copyObject (module.exports.temp, originalTemp());
	//module.exports.temp = originalTemp ();
};

module.exports = {
	temp : temp,
	data : data,
	write : write,
	writeTemp : writeTemp,
	factoryReset : factoryReset
};


