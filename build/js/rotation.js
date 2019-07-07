//webworker to calculate the position of multiples objects in realtime.

//get the variables from main process
self.onmessage = function(e) {
var data = e.data;
var d = data.d; //direction (clockwise or counterclockwise)
var i = data.i; //array index
var x = data.x; //x position
var z = data.z; //z position
var rotSpeed = data.rotSpeed; //rotation speed
// new values
var cx;
var cz;
//calculation  
if (d === 0){
 cx = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
 cz = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
 }
if (d == 1){ 
 cx = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
 cz = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed); 
}
// send results
self.postMessage({  
  i: i,
  x: cx,
  z: cz
}
);
  }//end


