'use strict';

/*
Shutdown library
shuts the system down if PWR_STATUS is low for more than PWR_STATUS_SECONDS
*/

var b;
var log = require ('./log-system');
var storage = require('./storage');

var child_process = require ('child_process');

var powerDate = null;

function verifyPowerStatus ()
{
	var value = b.digitalRead (process.env.PWR_STATUS_PIN);
	if (value === b.HIGH)
	{
		powerDate = Date.now ();
		storage.data.unitInformation.lastPowerLoss = powerDate;
		storage.write();
	}
	else if (powerDate)
	{
		if (Date.now() - powerDate > process.env.PWR_STATUS_SECONDS)
		{
			log.error ('power outage for more than the allowed seconds, shutting down');
			child_process.exec ('poweroff');
		}	
	}
	else
	{
		log.error ('Power was down at startup');
		//powerDate = Date.now ();
	}
	setTimeout (verifyPowerStatus, 1000);
}

try
{
	b = require ('bonescript');
	b.pinMode (process.env.PWR_STATUS_PIN, b.INPUT);
	verifyPowerStatus ();
}
catch (e)
{
	log.error ('power status not available', {error: e});
}
