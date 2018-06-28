'use strict';

/**
*  Requires modules
*/
var child_process = require ('child_process');
require('dotenv').config();
var log = require ('./log-system');
var storage = require('./storage');
var request = require('request');

// Setup BUF_EN
require ('./buffer_enable.js');

// Shutdown
//require ('./shutdown.js');

// ES Relay
require ('./esrelay.js');

var thermistors = require('./thermistors.js');

/**
*  Setup of uart pins if necessary
*/
if (!process.env.SKIP_SETUP_SERIAL)
{
	try
	{
		child_process.execSync ('bash startup.sh');
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
*  Catches fatal exceptions and exits
*/
process.on('uncaughtException', function (err){
	log.fatal (err);
	setTimeout (function ()
	{
		process.exit (-45);
	}, 5000);
});

/**
*  Requires modules
*/

var path = require ('path');
var fs = require ('fs');
var events = require ('./redis-events');
// var state = require ('./state.js');
var constants = require ('./ibot-elkay-variables');
var variables = constants;

require ('./nfc_ir.js');
var filter = require ('./nfc_filter.js');
filter.readFilterData ();
//filter.readMachineConfiguration();


/**
*  Global variables
*/
var state;

/**
*  Start event - does all necessary actions
*/
log.info ('Start event');
state = constants.state.BOOT;
events.emit (constants.event.state, state);
log.info('Emit BOOT state');



/**
* Check internet
*/

var wifi = require('./wifi.js');
wifi.init(log.error);
var checkInternet = wifi.checkInternet;

var faultTolerance = 0;
setInterval(function() {
	checkInternet(function(isConnected) {
		var old = storage.data.backendConnected;
		if (isConnected) {
			storage.data.backendConnected = true;
			if(old != true){
				storage.write();
			}
			faultTolerance = 0;
		} else {
			faultTolerance++;
			if(faultTolerance >= process.env.NETWORK_CONNECTION_FAIL_COUNT){
				storage.data.backendConnected = false;
				if(old != false){
					storage.write();
				}
				faultTolerance = process.env.NETWORK_CONNECTION_FAIL_COUNT;

				if (storage.data.network.wifi.ssid != undefined && storage.data.network.wifi.pass != undefined){
					wifi.connect (log.error, storage.data.network.wifi.ssid, storage.data.network.wifi.pass);
					faultTolerance = 0;
				}
				
			}
		}
	});
}, 1000);

var cellular = require('./cellular.js');

var cellularTimeoutFunction = function(){
	log.info('Cellular routine check');
	var cellularRunPy = cellular.reload();
	if (!storage.data.backendConnected){
		log.info('There is no network, cellular will try to connect to ' + cellularRunPy.ssid + ' ' + cellularRunPy.pass);
		if (cellularRunPy.ssid != '' && cellularRunPy.ssid != undefined){
			events.emit(constants.event.WIFIConnect, cellularRunPy.ssid, cellularRunPy.pass);
		}
	}
	setTimeout(cellularTimeoutFunction, cellular.next*60*1000);
};
setTimeout(cellularTimeoutFunction, cellular.next*60*1000);

/**
* Wi-Fi events
*/
events.on (constants.event.WIFIStart, function (){
	wifi.startScanNetworks (log.error,
		function (networkObject){
			events.emit (constants.event.WIFINetwork, networkObject);
		},
		process.env.WIFI_SCAN_INTERVAL, undefined/*process.env.WIFI_START_TIMEOUT*/);
});

events.emit(constants.event.WIFIStart);

/*events.on (constants.event.WIFIStop, function (){
	wifi.stopScanNetworks ();
});*/

events.on (constants.event.WIFIConnect, function (username, password){
	wifi.disconnect (log.error, function(){
		wifi.connect (log.error, username, password);
		var timeout = 0;
		var wifiConnectedInterval = setInterval( function () {
			if (wifi.connected(log.error)){
				storage.data.network.wifi.ssid = username;
				storage.data.network.wifi.pass = password;
				storage.write();
				events.emit (constants.event.WIFILinked);
				events.emit (variables.event.hiveStart);
				clearInterval(wifiConnectedInterval);
			}
			else{
				timeout++;
				if (timeout >= process.env.NETWORK_CONNECTION_FAIL_COUNT){
					storage.data.network.wifi.ssid = undefined;
					storage.data.network.wifi.pass = undefined;
					storage.write();
					events.emit (constants.event.WIFIUnlinked);
					clearInterval(wifiConnectedInterval);
				}
			}
		}, 1000);

	});
	
});

events.on (constants.event.WIFIDisconnect, function (){
	wifi.disconnect (log.error);
});

events.on (constants.event.boardDateTime, function(year, month, day, hour, minute){
	child_process.exec('date +%Y%m%d -s ' + (year + month + day) + ' && date +%T -s ' + (hour + ':' + minute + ':' + '00') + ' && hwclock -w', function (err, stdout, stderr){ //stdout, stderr
		if (err){
			log.error('Error in changing date and time');
		}
		log.info(stdout);
		log.info(stderr);
	});
});

events.on (constants.event.boardTimezone, function(timezoneFile){
	process.env.TZ = timezoneFile;
	
	fs.readFile(path.join(process.env.TIMEZONES_DIR_SOURCE, timezoneFile), 'utf8', function (err, data) {
		if (err){
			log.error('Could not read timezone file', err);
		}
		fs.writeFile (process.env.TIMEZONE_FILE_DESTINATION1, timezoneFile, function(err) {
			if (err){
				log.error('Could not write timezone file', err);
			}
			log.info('Timezone1 filecopied ' + timezoneFile + process.env.TIMEZONE_FILE_DESTINATION1);
		});
		fs.writeFile (process.env.TIMEZONE_FILE_DESTINATION2, data, function(err) {
			if (err){
				log.error('Could not write timezone file', err);
			}
			log.info('Timezone1 filecopied ' + process.env.TIMEZONE_FILE_DESTINATION2);
		});

		child_process.exec('dpkg-reconfigure -f noninteractive tzdata', function (err, stdout, stderr){
			if (err){
				log.error('Error in changing date and time');
			}
			log.info(stdout);
			log.info(stderr);
		});

	});

	/*fs.copyFile(path.join(process.env.TIMEZONES_DIR_SOURCE, timezoneFile), process.env.TIMEZONE_FILE_DESTINATION, fs.constants.COPYFILE_EXCL, function(err){
		if (err){
			log.error('Could not make symlink for timezone', err);
		}
	});*/
});

events.on (constants.event.mediaDownload, function(mediaId, mediaUrl){
	var downloadMediaTemp = request(mediaUrl).pipe(fs.createWriteStream(path.join(process.env.MEDIA_FOLDER, mediaId + '.temp')));
	downloadMediaTemp.on('finish', function(){
		fs.rename(path.join(process.env.MEDIA_FOLDER, mediaId + '.temp'),path.join(process.env.MEDIA_FOLDER, mediaId));
	});
});

events.on (constants.event.mediaReplace, function(mediaId, mediaUrl){
	var downloadMediaTemp = request(mediaUrl).pipe(fs.createWriteStream(path.join(process.env.MEDIA_FOLDER, mediaId + '.temp')));
	downloadMediaTemp.on('finish', function(){
		fs.rename(path.join(process.env.MEDIA_FOLDER, mediaId + '.temp'),path.join(process.env.MEDIA_FOLDER, mediaId));
	});
});

events.on (constants.event.mediaDelete, function(mediaId){
	fs.unlink(path.join(process.env.MEDIA_FOLDER, mediaId));
});


var restartProgram = function(){
	child_process.execSync ('supervisorctl restart ibot-elkay-control-logic-layer ibot-elkay-ui');
};

events.on(constants.event.factoryResetStart, function(){

	try{
		var setup = path.resolve (process.env.SETUP_FILE);
		fs.unlinkSync(setup);
	}
	catch(e){log.error('No .setup file');}
	wifi.disconnect (log.error, function(){ 
		//events.emit(variables.event.factoryResetDone);
		var counter1 = storage.data.counters.filterCounter;
		var counter2 = storage.data.counters.bottleOuncesCounter;
		var counter3 = storage.data.counters.bottles;
		var parameter4 = storage.data.mqtt.adminResetId;
		log.info('Counters saved on reboot' + counter1 + ' ' + counter2 + ' ' + counter3 + ' ' + parameter4);
		storage.factoryReset();
		storage.data.counters.filterCounter = counter1;
		storage.data.counters.bottleOuncesCounter =counter2;
		storage.data.counters.bottles = counter3;
		storage.data.mqtt.adminResetId = parameter4;
		storage.write();
		log.info('RESTARTING. This is the storage ' + storage.data);
		restartProgram();
	});

});


/*Checks passed tests and changes state accordingly*/

events.on (constants.event.UIStart, function (){
	events.emit (constants.event.state, state);
});

var testFile = path.resolve (process.env.TEST_FILE);
try
{
	//var tested = 
	fs.readFileSync (testFile, 'utf8');
	var read = true;
	if (read/*tested === 'true'*/)
	{
		var setupFile = path.resolve (process.env.SETUP_FILE);
		try
		{
			var setupDone = fs.readFileSync (setupFile, 'utf8');
			if (setupDone === 'true')
			{
				require ('./operationMode.js');
				state = constants.state.OPERATION_MODE;
				events.emit (constants.event.state, state);
				events.emit (constants.event.readMachineConfiguration);
				log.info ('Emit state OPERATION_MODE');
				log.info ('Emit readMachineConfiguration');
			}
			else
			{
				throw new Error ('Setup file has wrong value');
			}
		}
		catch (e)
		{
			if (e.code === 'ENOENT')
			{
				state = constants.state.SETUP_MODE;
				events.emit (constants.event.state, state);
				filter.readMachineConfiguration ();//events.emit (constants.event.readMachineConfiguration);
				log.info ('Emit state SETUP_MODE');















				/* Start the water fill in setup mode part
				 *
				 *
				 *
				 *
				 *
				 */

				var bfs = require ('./bfs.js');
				var alcove = require ('./alcove.js');
				var _ = require('lodash');
				var dispenseTimer = false;
				var dispenseStartTime = null;
				var dispenseStopTime = null;
				var twentySecondTimer = null;
				var obstructionTimer = null;
				var obstructedForMqtt = false;
				var isBottleInRange = false;
				var bottles;

				var nextIdleSourceTimeout = undefined;
				var mediaAllowedUI = true;
				var mediaAllowedWater = true;



				events.on (constants.event.updateReceivedFromIR, function (msg/*, field1, field2*/){
					if (msg === constants.parameter.BOTTLE_IN_RANGE)
					{
						if (!isBottleInRange){
							isBottleInRange = true;

							events.emit (variables.event.stopIdle, undefined, true);
							
							events.emit (constants.event.dispenseEvent, constants.parameter.START);
							events.emit (constants.event.twentySecondTimer, constants.parameter.START);
							events.emit (constants.event.obstructionTimer, constants.parameter.START);
							events.emit (variables.event.mqttSend, 'BottleDetected');
						}
					}
					else
					if (msg === constants.parameter.BOTTLE_OUT_OF_RANGE)
					{
						if (isBottleInRange){
							isBottleInRange = false;

							nextIdleSourceTimeout = setTimeout( function() {
								events.emit (variables.event.startIdle, -1, undefined, true);
							}, process.env.IDLE_STATE_TIMER * 1000);

							events.emit (constants.event.dispenseEvent, constants.parameter.STOP);
							events.emit (constants.event.twentySecondTimer, constants.parameter.STOP);
							events.emit (constants.event.obstructionTimer, constants.parameter.STOP);
						}
					}
						
				});

				

				events.on (constants.event.dispenseEvent, function (msg){
					if (msg === constants.parameter.START)
					{
						bfs.setOn ();
						alcove.setOn ();
						events.emit (constants.event.dispenseTimer, constants.parameter.START);
					}
					else if (msg === constants.parameter.STOP)
					{
						bfs.setOff ();
						if (storage.data.unitInformation.alcove)
							alcove.setOnBacklight ();
						else
							alcove.setOff ();
						
						events.emit (constants.event.dispenseTimer, constants.parameter.STOP);
						
						var dispenseDuration = Math.abs (dispenseStopTime - dispenseStartTime);
						dispenseStopTime = null;
						dispenseStartTime = null;
						if (!isNaN (dispenseDuration))
						{
							var flowCapacity;
							if (storage.data.device.refrigerated)
								flowCapacity = process.env.REFRIGERATED_OUNCES_PER_MIN;
							else
								flowCapacity = process.env.NON_REFRIGERATED_OUNCES_PER_MIN;
							var dispensed = dispenseDuration * flowCapacity / (1000.0*60.0);

							var bottleOuncesCounter = storage.data.counters.bottleOuncesCounter + dispensed;
							bottles = Math.trunc (bottleOuncesCounter / process.env.BOTTLE_CAPACITY);
							if (storage.data.counters.bottleOuncesCounter < bottleOuncesCounter){
								storage.data.counters.bottleOuncesCounter = bottleOuncesCounter;
							}
							if (storage.data.counters.bottles < bottles){
								storage.data.counters.bottles = bottles;
							}
							storage.write();
							//events.emit (constants.event.updateFilterNFC, dispensed); NO FILTER DIRRING SETUP MODE
						}
					}
				});

				

				events.on (constants.event.dispenseTimer, function (msg){
					if (msg === constants.parameter.START)
					{
						if (!dispenseTimer)
						{
							dispenseStartTime = new Date ();
							dispenseTimer = true;
							log.info ('Started timer '+dispenseStartTime);
						}
					}
					else if (msg === constants.parameter.STOP)
					{
						if (dispenseTimer)
						{
							dispenseTimer = false;
							dispenseStopTime = new Date ();
							log.info ('Dispense timer stopped');
						}
					}
				});

				events.on (constants.event.twentySecondTimer, function (msg){
					if (msg === constants.parameter.START)
					{
						if (twentySecondTimer !== null)
						{
							clearTimeout (twentySecondTimer);
						}
						twentySecondTimer = setTimeout (function (){
							if (twentySecondTimer)
							{
								events.emit (constants.event.dispenseEvent, constants.parameter.STOP);
							}
						}, process.env.X_SECONDS);
					}
					else if (msg === constants.parameter.STOP)
					{
						if (twentySecondTimer !== null)
						{
							clearTimeout (twentySecondTimer);
						}
						twentySecondTimer = null;
					}
				});

				events.on (constants.event.obstructionTimer, function (msg){
					if (msg === constants.parameter.START)
					{
						if (obstructionTimer !== null)
						{
							clearTimeout (obstructionTimer);	
						}
						obstructionTimer = setTimeout (function (){
							if (obstructionTimer)
							{
								events.emit (constants.event.obstructionTimer, constants.parameter.TIMEOUT);
								storage.temp.sensorObstructed = true;
								storage.writeTemp();
							}
						}, process.env.X_SECONDS);
						log.info ('Obstruction timer started');
					}
					else if (msg === constants.parameter.STOP)
					{
						if (obstructionTimer !== null)
						{
							clearTimeout (obstructionTimer);
						}
						obstructionTimer = null;
						storage.temp.sensorObstructed = false;
						storage.writeTemp();
						
						if (obstructedForMqtt == true){
							events.emit (variables.event.mqttSend, 'ErrorNotification', ['SensorCleared']);

							storage.data.maintenanceCodes.data.push('SensorCleared');
							storage.data.maintenanceCodes.unread = true;
							storage.write();
						}
						obstructedForMqtt = false;
						
						log.info ('Obstruction timer stopped');
					}
					else if (msg === constants.parameter.TIMEOUT)
					{
						obstructedForMqtt = true;
						events.emit (variables.event.mqttSend, 'ErrorNotification', ['SensorObstructedAfterTimeout']);

						storage.data.maintenanceCodes.data.push('SensorObstructedAfterTimeout');
						storage.data.maintenanceCodes.unread = true;
						storage.write();

						log.info ('Obstruction timer timeout');
					}
				});

				/* idle change media */
				events.on (variables.event.startIdle, function(step, fromUI, pourWater){
					/*if (step!=-5){
						return;
					}for testing without overlay*/
					if (fromUI == true){
						mediaAllowedUI = true;
					}

					if (pourWater == true){
						mediaAllowedWater = true;
					}

					if (mediaAllowedUI == true && mediaAllowedWater == true){
						storage.temp.idle.operationModeIdle = true;
						if (step == undefined){
							step = 0;
						}

						if (step < 0){
							events.emit(variables.event.startIdle);
							return;
						}

						if (storage.data.media.length == 0){
							storage.temp.idle.path = undefined;
							storage.temp.idle.type = undefined;
							if (storage.temp.idle.missing == 0){
								storage.temp.idle.missing = 1;
							}
							else if (storage.temp.idle.missing == 1){
								storage.temp.idle.missing = -1;
							}
							else if (storage.temp.idle.missing == -1){
								storage.temp.idle.missing = 1;
							}
							else{
								log.error('storage.temp.idle.missing was ' + storage.temp.idle.missing + ' instead of 0 1 or -1');
								storage.temp.idle.missing = 0;
							}
							nextIdleSourceTimeout = setTimeout(function (){
								events.emit(variables.event.startIdle, step);
							}, process.env.IDLE_STATE_TIMER * 1000);
						}
						else{
							log.error('I have media');
							var mediaArray = _.filter(storage.data.media, {'Sequence' : step});
							log.error('Media array is' + JSON.stringify(mediaArray));
							if (mediaArray.length == 0){
								if (step == 0){
									log.info ('Have not received the order for the media');
									nextIdleSourceTimeout = setTimeout(function (){
										events.emit(variables.event.startIdle);
									}, process.env.IDLE_STATE_TIMER * 1000);
								}
								else{
									events.emit(variables.event.startIdle);
								}
							}
							else if (mediaArray.length == 1){
								storage.temp.idle.path = process.env.MEDIA_FOLDER + '/' + mediaArray[0].MediaId;
								storage.temp.idle.type = mediaArray[0].MediaType;
								storage.temp.idle.missing = 0;
								nextIdleSourceTimeout = setTimeout(function (){
									events.emit(variables.event.startIdle, step+1);
								}, mediaArray[0].Duration*1.2+parseInt (process.env.MPLAYER_DELAY));
							}
							else {
								log.error('More than 1 media with the same sequence number ' + step);
								storage.temp.idle.path = process.env.MEDIA_FOLDER + '/' + mediaArray[0].MediaId;
								storage.temp.idle.type = mediaArray[0].MediaType;
								storage.temp.idle.missing = 0;
								nextIdleSourceTimeout = setTimeout(function (){
									events.emit(variables.event.startIdle, step+1);
								}, mediaArray[0].Duration*1.2+parseInt (process.env.MPLAYER_DELAY));
							}

						}
						storage.writeTemp();
					}
					
				});

				events.on (variables.event.stopIdle, function(fromUI, pourWater){
					if (fromUI == true){
						mediaAllowedUI = false;
					}
					if (pourWater == true){
						mediaAllowedWater = false;
					}
					storage.temp.idle.operationModeIdle = false;
					storage.temp.idle.path = undefined;
					storage.temp.idle.type = undefined;
					storage.temp.idle.missing = 0;
					storage.writeTemp();
					clearTimeout(nextIdleSourceTimeout);
					nextIdleSourceTimeout = undefined;
				});

				nextIdleSourceTimeout = setTimeout( function() {
					events.emit (variables.event.startIdle);
				}, process.env.IDLE_STATE_TIMER * 1000);


				/*
				 *
				 *
				 *
				 *
				 *
				 * End the water fill in setup mode part */



























				events.on (constants.event.setupDone, function ()
				{
					// TODO save setup
					fs.writeFileSync (setupFile, 'true');
					//restartProgram();
				});

				events.on (constants.event.setupDoneRestart, function ()
				{
					restartProgram();
				});
			}		
			else{
				throw (new Error ('Could not read setup status file'));
			}
		}
	}
	else
	{
		throw new Error ('Test file has wrong value');
	}
}
catch (e)
{
	if (e.code === 'ENOENT')
	{
		require ('./testMode.js');
		state = constants.state.TEST_MODE;
		events.emit (constants.event.state, state);
		log.info ('Emit state TEST_MODE');
	}		
	else{
		throw (new Error ('Error in test status file '+e));
	}
}

var hive  = undefined;
events.on (variables.event.hiveStart, function(){
	if (hive == undefined){
		hive = require('./hive');
		//hive.init();
	}
	hive.init();
});

events.on (variables.event.mqttStart, function(){
	require('./mqtt');

	setInterval ( function(){
		events.emit (variables.event.mqttSend, 'HeartBeat', [
			storage.temp.network.wifi.ssid,
			storage.temp.network.wifi.rawSignal,
			((storage.temp.network.wifi.ssid == undefined) ? 'Disconnected' : 'Connected'),
			'Disconnected', //Cellulary
			((storage.data.mqtt.lastCloud == 'now') ? (new Date()) : storage.data.mqtt.lastCloud),
			storage.data.mqtt.lastFill,
			storage.data.filter.useGallons,
			(storage.temp.sensorObstructed ? 'True' : 'false'),
			storage.data.counters.bottleOuncesCounter,
			[thermistors.compressor_temperature(), thermistors.evaporator_temperature()],
			storage.data.unitInformation.lastPowerLoss,
			(storage.data.energySave.active ? 'On' : 'Off')
		]);
	}, parseInt (process.env.HEARTBEAT_INTERVAL) * 60 * 1000);

});

var settingsTimeout = undefined;
var lastSettingsTimeout = undefined;

var sendSettingsTimeout = function(){
	clearTimeout(settingsTimeout);
	settingsTimeout = undefined;
	events.emit (variables.event.settingsTimeout, variables.parameter.TIMEOUT, lastSettingsTimeout);
};

events.on (variables.event.settingsTimeout, function (msg, who){
	if (msg == variables.parameter.START){
		log.info('settingsTimeout start');
		log.info (process.env.IDLE_TIMEOUT);
		clearTimeout(settingsTimeout);
		lastSettingsTimeout = who;
		settingsTimeout = undefined;
		settingsTimeout = setTimeout(sendSettingsTimeout, parseFloat(process.env.IDLE_TIMEOUT) * 60 * 1000);
	}
	else if (msg == variables.parameter.STOP){
		log.info('settingsTimeout stop');
		clearTimeout(settingsTimeout);
		settingsTimeout = undefined;
	}
});
