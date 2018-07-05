// read the uart data from MSP and export to other file
var child_process = require ('child_process');
require('dotenv').config();

var serialport = require('serialport');
var serialPort = new serialport("/dev/ttyO4", {
  baudRate: 115200,lock:false});

var fs = require("fs");
var content = fs.readFileSync("settings.json");
var jsonContent = JSON.parse(content);

var doorStatus=0; // 1- open , 0 - close

var b = require('bonescript');
b.pinMode('P8_16', b.OUTPUT);

var events = require ('./redis-events');
var EventEmitter = require('redis-events').EventEmitter;
var emitter = new EventEmitter();
var ref_array=[];
var current_array=[];
var transmit;
var myUartData;


child_process.execSync ('bash startup.sh');

emitter.once('startapp', function(arg1){
    if(arg1 == "appstart")
    {
       emitter.emit('startEvent',"operationMode");
    }   
});

//emitter.emit('startEvent',"operationMode"); // 

emitter.on('startOperationMode',function(arg1){
 		//console.log(arg1);
		//console.log("startOperationMode running");

        	if( (arg1.toString() === "Start")  )
        	{
        	ref_array = current_array;
        	transmit = 1;
        	console.log(" transmit 1");
        	emitter.emit('lockStatus',"Unlock");
                emitter.on('okStatus',function(arg1){
                    if(arg1== "ok")
                    {
                       emitter.emit('doorStatus',1);
                    }
                });   
                
                }
        	else // ((arg1.toString() === "Stop"))
        	{
         	//transmit = 0;  // stop sending
         	console.log(" transmit 0");
        	}

	});

function readDoorStatus(){

console.log("readDoorStatus");
//var value = b.digitalRead (process.env.DOOR_STATUS_PIN);
var value = b.digitalRead ('P8_12');

        if (value === b.HIGH)
        {
	   //transmit = 1;
	   doorStatus = 1;
           console.log("DoorOpen");
           b.digitalWrite('P8_16',1);
           //ref_array = current_array;

        }
        else
        {
	   doorStatus = 0;
           transmit = 0;
	   console.log("DoorClose");   
           b.digitalWrite('P8_16',0);
        }

	emitter.emit('doorStatus',doorStatus);

}



serialPort.on("open", function () {
  console.log('uart4 open ok');
  
  serialPort.on('data', function(data) {
  myUartData = data.toString('utf8');
  console.log(myUartData);
  current_array = myUartData;
 
  serialPort.write("Hi How are you", function() {
  console.log("writing");
  
  readDoorStatus();

  
  });

    var fields = myUartData.split(',');
    var i=fields[0].length;
    fields[0]= fields[0].slice(1,i);

    i=fields[5].length; // remove ';' from field
    fields[5]=fields[5].slice(0,(i-1));

    current_array = fields;
    
    
   if( ( transmit)  && (doorStatus ))
   {
        console.log("transmit:"+transmit);
        console.log("doorStatus:"+doorStatus);

	IcecreamInventryUpdate();
        console.log(" Start Inverntory update");
   }
   else
   {
	//console.log("Stop Inverntory update to UI");
        //console.log(current_array);

   } 
 
});
});

function machinemode_check() {

        //console.log(jsonContent.machineMode);

        if(jsonContent.machineMode == 'operationMode')
        {
           console.log(jsonContent.machineMode );
        }
        else if (jsonContent.machineMode == 'testMode')
        {
                console.log("testMode#");
                //sensordata.testAmbientTemp;
                //testAmbientTemp();
                //testInternalTemp();

        }

}






function IcecreamInventryUpdate() {

var arr1=[];
var objisempty = 0;
//console.log(current_array);
//console.log(ref_array)

//if(isEmpty(ref_array) && (current_array) )
//{  
  //  objisempty = 0; 
//}
//else
//{  
//   objisempty = 1;
//}

//if(objisempty == 1)
//{
	var diff_arr = ref_array.map(function(item, index) {
  	// In this case item correspond to currentValue of array a,
  	// using index to get value from array b
  	return item - current_array[index];
	});

        if (diff_arr.length != 0)
        {
              console.log(diff_arr.length);
                   count=0;
                    diff_arr.forEach(function(value) {
                      console.log(value);
                       count ++;
                       var object = {};
                       if(( value >=0) && ( count < 6) )
		       {
                       object.count = value;
                       object.name ="basket"+count;
                       object.price = value + count;
                       arr1.push(object);
		       }
                     });


                   var json = JSON.stringify(arr1);
                   //console.log(json);
			
                   //if( ( transmit)  && (doorStatus ))
		   if(transmit)
		   {
                    console.log("Sending data");
		    console.log(json);
		    emitter.emit('inventoryUpdated',json); 		
        	   }
	}else
        {
           var json1 = JSON.stringify(arr1);
           console.log("empty");

        }
//}

}






