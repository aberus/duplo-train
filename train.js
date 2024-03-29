function connect() {

  console.log("connect");

  navigator.bluetooth.requestDevice({
       filters: [
         {
           services: ['00001623-1212-efde-1623-785feabcd123']
         }
       ]
    })
  .then(device => {
      window.device = device;
      return device.gatt.connect();
    })
  .then(server => {
      window.server = server;
      return server.getPrimaryService('00001623-1212-efde-1623-785feabcd123');
    })
  .then(service => {
      window.service = service;
      return service.getCharacteristic('00001624-1212-efde-1623-785feabcd123');
    })
  .then(characteristic => {
      window.characteristic = characteristic;
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    })
}

function shutdown() {
  var data = Int8Array.of(0x04, 0x00, 0x02, 0x01);
  characteristic.writeValue(data);
}

function forward() {
  drive(50);
}

function reverse() {
  drive(-40);
}

function stop() {
  drive(0);
  
  write([0x41, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01]);
  

setTimeout(function () {
  playSound(3);
  }, 500);
}

function color(colorValue) {
  var port = 0x11;
  var mode = 0x00;
  write([0x81, port, 0x01, 0x51, mode, colorValue]);
}

function playSound(sound) {

  write([0x81, 0x01, 0x11, 0x51, 0x01, sound]);
}



function drive(speed) {
  if(speed > 100) {
    throw new RangeError("Speed can't be higher then 100.")
  }
  if(speed < -100) {
    throw new RangeError("Speed can't be lower then -100.")
  }
     //  0x81, 0x00, 0x00, 0x51, 0x00,
  write([0x81, 0x00, 0x01, 0x51, 0x00, speed]);
}

function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received', new Int8Array(value.buffer.slice(2)));
}

function write(data) {
  var message = new Int8Array(2 + data.length);
  message[0] = message.length;
  message.set(data, 2);
  characteristic.writeValue(message);
}

// train's response to invalid command: [5, 0, 5, -127, 5] = size, zero (protocol or high byte of message size), message type = error, probably id of command sent to train, some error code?
//
//write([0x81, 0x00, 0x00, 0x51, 0x00, speed]);
//                   ^ odd numbers are invalid and cause error
//
//
/*
 *
 * function test() {
  console.log(i);
  write([i, 0, 0, 0, 0, 0]);
  i++;
  if(i < 256) setTimeout(test, 200); 
}

VM2108:2 1
train.js:55 Received Int8Array(5) [5, 0, 5, 1, 6]
VM2108:2 2
train.js:55 Received Int8Array(5) [5, 0, 5, 2, 6]
VM2108:2 3
train.js:55 Received Int8Array(5) [5, 0, 5, 3, 6]
VM2108:2 5
VM2108:2 33
train.js:55 Received Int8Array(5) [5, 0, 69, 0, 0]
VM2108:2 34
train.js:55 Received Int8Array(17) [17, 0, 68, 0, 0, 0, 84, 32, 77, 79, 84, 0, 0, 0, 0, 0, 0]
VM2108:2 65
train.js:55 Received Int8Array(10) [10, 0, 71, 0, 0, 0, 0, 0, 0, 0]
VM2108:2 66
train.js:55 Received Int8Array(5) [5, 0, 5, 66, 6]
VM2108:2 97
train.js:55 Received Int8Array(5) [5, 0, 5, 97, 6]
*/
