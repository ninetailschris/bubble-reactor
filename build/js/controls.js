var rotSpeed = .03;
var worker = new Worker('js/rotation.js');

//---------------------------------------------------------------
//ESCAPE press
//---------------------------------------------------------------
kd.ESC.up(function () {
if (control.enabled){
updateInterface(4);
pause();
}
});
//---------------------------------------------------------------
//CAMERA rotation
//---------------------------------------------------------------
function cameraRot() {
if (autoRot.enabled){
// send 
worker.postMessage({
	d: 0,
	i: -1,
	rotSpeed: 0.003,
	x: camera.position.x,
	z: camera.position.z
});
}
}
//---------------------------------------------------------------
//ARROW LEFT press
//---------------------------------------------------------------
kd.LEFT.down(function () {
if (control.enabled){
for ( i = 0; i < camFollow.length; i ++ ) {	
// send 
worker.postMessage({
	d: 0,
	i: i,
	rotSpeed: rotSpeed,
	x: camFollow[i].position.x,
	z: camFollow[i].position.z
});
}
}
});
//---------------------------------------------------------------
//ARROW RIGHT press
//---------------------------------------------------------------
kd.RIGHT.down(function () {
if (control.enabled){
for ( i = 0; i < camFollow.length; i ++ ) {	
// send 
worker.postMessage({
	d: 1,
	i: i,
	rotSpeed: rotSpeed,
	x: camFollow[i].position.x,
	z: camFollow[i].position.z
});
}
}
 });
//---------------------------------------------------------------
//RAYCAST on SPACE KEY press
//---------------------------------------------------------------
 kd.SPACE.up(function () {
if (control.enabled){
	control = { enabled : false};
	x = aimSphere.position.x,
    z = aimSphere.position.z;	 
	 
//Normalized direction vector3	 
var direction = new THREE.Vector3( 0, 100, 0 );
	direction.normalize();
	
//origin for left raycast --------------------
var orx = x * Math.cos(0.11) - z * Math.sin(0.11);
var orz = z * Math.cos(0.11) + x * Math.sin(0.11);
	origin = new THREE.Vector3( orx, aimSphere.position.y, orz );
//Raycast left
	raycaster = new THREE.Raycaster(origin, direction);
var lHit = raycaster.intersectObjects( sphereCollide );

//origin for right raycast --------------------
	orx = x * Math.cos(0.11) + z * Math.sin(0.11);
	orz = z * Math.cos(0.11) - x * Math.sin(0.11);
	origin = new THREE.Vector3( orx, aimSphere.position.y, orz );
//Raycast right
	raycaster = new THREE.Raycaster(origin, direction);
var rHit = raycaster.intersectObjects( sphereCollide );
//first left collision
var Li = lHit[ 0 ].object.i;
var Lj = lHit[ 0 ].object.j;
//first right collision
var Ri = rHit[ 0 ].object.i;
var Rj = rHit[ 0 ].object.j;
//get highest ring hit
var allRing = [Li,Ri]
var hRing = Math.max (...allRing);

var mat = aimSphere.mat;

//middle hit
if (Li == hRing && Ri == hRing) {
if(hRing&1){ // even/odd ring check
if(Lj == totalSpheres-1){shotSphere(Li+1,0,mat)} else {shotSphere(Li+1,Lj+1,mat);}
}else{
shotSphere(Li+1,Lj,mat);
}
}
//left hit
if (Li == hRing && Ri < hRing) {
if(hRing&1){ // even/odd ring check
if(Lj == totalSpheres-1){shotSphere(Li+1,0,mat)} else {shotSphere(Li+1,Lj+1,mat);}
}else{
shotSphere(Li+1,Lj,mat);
}
}
//right hit
if (Ri == hRing && Li < hRing) {
if(hRing&1){ // even/odd ring check
shotSphere(Ri+1,Rj,mat);
}else{
if(Rj === 0){shotSphere(Ri+1,totalSpheres-1,mat)} else {shotSphere(Ri+1,Rj-1,mat);}	
}
}
}
});
//---------------------------------------------------------------
//ARROW HELPER
//---------------------------------------------------------------
function arrowHelp() {
//Normalized direction vector3	 
var direction = new THREE.Vector3( 0, 100, 0 );
	direction.normalize();

	x = aimSphere.position.x,
    z = aimSphere.position.z;

var orx = x * Math.cos(0.11) - z * Math.sin(0.11);
var orz = z * Math.cos(0.11) + x * Math.sin(0.11);
	origin = new THREE.Vector3( orx, aimSphere.position.y, orz );
var arrowL = new THREE.ArrowHelper( direction, origin, 50, 0xffffff );
	camFollow.push(arrowL);
	scene.add( arrowL );
	
	orx = x * Math.cos(0.11) + z * Math.sin(0.11);
	orz = z * Math.cos(0.11) - x * Math.sin(0.11);
	origin = new THREE.Vector3( orx, aimSphere.position.y, orz );
var arrowR = new THREE.ArrowHelper( direction, origin, 50, 0xffffff );
	camFollow.push(arrowR);
	scene.add( arrowR );
 }
//---------------------------------------------------------------
//WEBWORKER
//---------------------------------------------------------------
worker.onmessage = function(e) {

	i = e.data.i;
	if(i>=0){
	camFollow[i].position.x = e.data.x;
	camFollow[i].position.z = e.data.z;
	}else{
	if (autoRot.enabled){	
	var dtime	= Date.now() - startTime;
	camera.position.x = e.data.x;
	camera.position.z = e.data.z;
	camera.position.y = 50+20*Math.sin(dtime/6000);
	}
}
camera.lookAt(new THREE.Vector3(0,0,0));
}
 //---------------------------------------------------------------
//C press
//---------------------------------------------------------------
kd.C.up(function () {
	//console.log(map);
	console.log(control.enabled);
});