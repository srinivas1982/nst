var crc16 = require('crc-16');

// Calculate the CRC of a simple two-byte buffer
var buf = new Buffer(['#',2500,2400,2200,1800,1250,0x00, 0x00,';']);
var crc = crc16(buf);

console.log('crc:', crc);
