var b = require('bonescript');

b.pinMode('P8_12', b.INPUT);
b.pinMode('P8_16', b.OUTPUT);

setInterval(copyInputToOutput, 100);

function copyInputToOutput() {
    b.digitalRead('P8_12', writeToOutput);
    function writeToOutput(x) {
        b.digitalWrite('P8_16', x.value);
    }
}

