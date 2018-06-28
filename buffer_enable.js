'use strict';

/* 
Bufferv Enable library
sets BUF_EN_PIN to high
*/

var b;
var log = require ('./log-system');

try
{
	b = require ('bonescript');
	b.pinMode (process.env.BUF_EN_PIN, b.OUTPUT);
	b.digitalWrite (process.env.BUF_EN_PIN, b.HIGH);	
}
catch (e)
{
	log.error ('buffer_enable not available', {error: e});
}
