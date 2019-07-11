//global variables
//------------------------------------------------------------
var camFollow = []; //array to store objects following camera, they are used by the webworker.
//Single buffered point to display sphere material.
var vertices = [0,0,0];
var geoColor = new THREE.BufferGeometry();
geoColor.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
//---
var geometry =  new THREE.PlaneBufferGeometry( 3.8, 2,1,1);//invisible plane for raycast collision
var sphereMat = [];   //array to store sphere materials
var aimSphere;        //the sphere used to aim
var prevSphere;       //the preview of the sphere who come next
var tweenSphere;      //sphere used for reload animation
var destroyArray =[]; //garbage collector
var stackNbr = 0;     //stack of sphere remaining for 'puzzle mode'
var FXtime = 1;       //explosion timer
var FXtimeout;        //explosion setIntervall
//var size = 3.2;
//var totalSpheres = 24;
var totalSpheres = 20;  //sphere per ring
var sphereArray = [];   //array to store sphere data
var sphereCollide = []; //array to store plane for raycast collision
var totalRing = 11;     //number of rings
var gap = -3.2;         //gap between rings
var offset = 20;        //offset to move the whole puzzle up/down
//parameters to construct the rings
var circleRadius = 12;
var diameter = circleRadius*2;
var startAngle = 0;
var mpi = Math.PI/180;
var startRadians = startAngle + mpi;
var calcRadians = startRadians;
var incrementRadians =  360/totalSpheres * mpi;
//game logic
var timer;
var clusterColor=[];
var control = { enabled : false};     //enable keyboard controls
var autoRot = { enabled : true};      //enable camera path on title screen
// Neighbors offset array (to find same color neighbors)
var neighborOffset = [[[0, 0], [-1, 1], [-1, 0], [0, 1], [0, -1], [1,1], [1, 0]], // Odd ring
						[[0, 0], [-1, 0], [-1, -1], [0, 1], [0, -1], [1,0], [1, -1]]];  // Even ring
//------------------------------------------------------------
//DRAW MAIN SCENE
//------------------------------------------------------------
function gameStart(){
	drawScene();
	drawLights();
	drawSkybox();
	loadMaterials();
	loadSounds();
//puzzle construction
//------------------------------------------------------------	
for(var i = 0; i < totalRing; i++){
    sphereArray[i] = [];    
    for(var j = 0; j < totalSpheres; j++){
	//position	
	var xp = Math.sin(calcRadians) * circleRadius;
	var zp = Math.cos(calcRadians) * circleRadius;	

	//store value of all sphere 0:x position  1:z position 2:color 3:neighbors 4:point 5:plane)
	sphereArray[i][j] = [xp,zp,0,0];
	//increment position
	calcRadians += incrementRadians;
	}
	//shift ring rotation to obtain an hexagonal grid
	if (i&1) {
	calcRadians = startRadians;
	} else {
	calcRadians = startRadians + incrementRadians/2;	
	}	
}
//create PointsMaterials for each colors
for(var i = 0; i < sprite.length; i++){
sphereMat[i] = new THREE.PointsMaterial({
size: 17,
sizeAttenuation: true,
map: sprite[i],
alphaTest: 0.5,
transparent: true
});
}	
//Drawing loop
for ( var i = 0; i < totalRing; i ++ ) {
	for ( var j = 0; j < totalSpheres; j ++ ) {	
	
  var	mat = sphereArray[i][j][2];
	//draw PointsMaterials Billboards
  var points = new THREE.Points(geoColor, sphereMat[mat]);
	points.position.x = sphereArray[i][j][0];
	points.position.y = gap*i+offset;
	points.position.z = sphereArray[i][j][1];
	sphereArray[i][j][4] = points;
	scene.add(points);
	//invisible raycast plane
var plane = new THREE.Mesh(geometry);
	plane.position.x = sphereArray[i][j][0];
	plane.position.y = gap*i+offset;
	plane.position.z = sphereArray[i][j][1];
	plane.lookAt( 0,gap*i+offset,0);
var axis = new THREE.Vector3(1,0,0);
	plane.rotateOnAxis (axis, 90 * Math.PI/180)
	plane.material.visible = false;
	plane.i=i;
	plane.j=j;
	sphereArray[i][j][5] = plane;
	//if (sphereArray[i][j][2] === 0 ) {
	//plane.visible = false;
	//}
	sphereCollide.push(plane);
	scene.add( plane );
	}
}
//add aim sphere
	mat = randColor();
	aimSphere = new THREE.Points(geoColor, sphereMat[mat]);
	aimSphere.mat = mat;
	scene.add(aimSphere);
	camFollow.push(aimSphere);
	//add preview sphere
	mat = randColor();
	prevSphere = new THREE.Points(geoColor, sphereMat[mat]);
	prevSphere.mat = mat;
	scene.add(prevSphere);
	camFollow.push(prevSphere);
	//add tweensphere
	tweenSphere = new THREE.Points(geoColor, sphereMat[0]);
	tweenSphere.mat = 0;
	scene.add(tweenSphere);
	camFollow.push(tweenSphere);
	//add 30 animated billboards to display explosions (explosion chain should not go over 30!)
	for(var i = 0; i < 30; i++){
	destroyArray[i] = new THREE.Points(geoColor, sphereMat[9]);
	destroyArray[i].position.x = 0;
	destroyArray[i].position.y = -500;
	destroyArray[i].position.z = 0;
	scene.add(destroyArray[i]);
	}
	//add 'warning' cylinder
	var geowarning = new THREE.CylinderGeometry( 13,13,4,20,1,true );
	var matwarning = new THREE.MeshBasicMaterial( {map:texture[1], side:THREE.DoubleSide, transparent: true} );
	matwarning.alphaTest = 0.5;
	warning = new THREE.Mesh( geowarning, matwarning );
	warning.doubleSided = true;
	warning.position.y = gap*(totalRing)+offset;
	warning.visible = false;
	scene.add( warning );
	
  //the game is now ready. Display camera intro
	mainTitle();
}
//------------------------------------------------------------
//FUNCTION
//------------------------------------------------------------
function mainTitle(){
updateInterface(0);
$('.menus').css({'display':'block'});
$('.title').css({'display':'block'});
timeMode();
flyCam();
}

function game(){
$('.menus').css({'display':'none'});
$('.title').css({'display':'none'});
autoRot.enabled = false;
control.enabled = true;
scene.fog.far = 150;
scene.fog.near = 110;
camera.position.set(0,-50,110);
camera.lookAt(new THREE.Vector3(0,0,0));
}

function debug(){
arrowHelp();
for ( var i = 0; i < sphereCollide.length; i ++ ) {
sphereCollide[i].material.visible=true;
}
}

function pause(){
control.enabled = false;
$('.menus').css({'display':'block'});
}

function resume(){
$('.menus').css({'display':'none'});
control.enabled = true;
}
//init Time mode-------------------------------------------------
function timeMode(){
console.log("Timer");
//timer = setInterval(myTimer, 1000);
mode='time';	
var mat;
for(var i = 0; i < totalRing; i++){
    for(var j = 0; j < totalSpheres; j++){
		
	//indestructible ring on the first row
	if(i === 0){mat = 1;}
	//sphere for the next five rings
	if ( i > 0 && i < 5) {
	mat = randColor();
	sphereArray[i][j][5].visible = true;
	}
	//no sphere on remaining rings
	if ( i >= 5) {
	mat = 0;
	sphereArray[i][j][5].visible = false;
	}
	sphereArray[i][j][2] = mat //update array
	sphereArray[i][j][4].material = sphereMat[mat];//update material
	}
}
mat = randColor(); //set aim sphere
aimSphere.material = sphereMat[mat];
aimSphere.mat = mat;
mat = randColor(); //set preview sphere
prevSphere.material = sphereMat[mat];
prevSphere.mat = mat;
}
//init puzzle mode-------------------------------------------------
function puzzleMode(){
mode='puzzle';	
for(var i = 0; i < totalRing; i++){
    for(var j = 0; j < totalSpheres; j++){
			var mat = puzzleArray[activPuzzle].puzzle[i][j];
			sphereArray[i][j][2] = mat //update array
			sphereArray[i][j][4].material = sphereMat[mat];//update material
			if (sphereArray[i][j][2] === 0 ) {
			sphereArray[i][j][5].visible = false; //disable raycast
			}else{sphereArray[i][j][5].visible = true;}//enable raycast}
		}
}
var mat2 = puzzleArray[activPuzzle].stack[0]; //set first sphere
aimSphere.material = sphereMat[mat2];
aimSphere.mat = mat2;
mat2 = puzzleArray[activPuzzle].stack[1]; //set first sphere
prevSphere.material = sphereMat[mat2];
prevSphere.mat = mat2;
game();
}
//flying camera-------------------------------------------------
function flyCam(){	
	
scene.fog.far = 500;
scene.fog.near = 400;

camera.position.set(0,0,200 );
camera.lookAt(new THREE.Vector3(0,0,0));

//reset objects following cam
camFollow[1].position.x = camFollow[2].position.x = camFollow[3].position.x = Math.sin(startAngle + mpi) * circleRadius;
camFollow[1].position.z = camFollow[2].position.z = camFollow[3].position.z = Math.cos(startAngle + mpi) * circleRadius;
camFollow[1].position.y = camFollow[3].position.y = gap*(totalRing+1)+offset;
camFollow[2].position.y = gap*(totalRing+3)+offset;

autoRot.enabled = true;
control.enabled = false;
}
//shot sphere-------------------------------------------------
function shotSphere(i,j,mat){
	tweenSphere.material = aimSphere.material;
	aimSphere.material = sphereMat[0];
		// Create a tween
	var tween = new TWEEN.Tween(tweenSphere.position).to({
		x: sphereArray[i][j][0],
		y: gap*i+offset,
		z: sphereArray[i][j][1]
		}, 200)
		.onStart(function() {
		})
		.onComplete(function(){
		sound[0].play();
		sphereArray[i][j][2] = mat;//update array
		sphereArray[i][j][4].material = sphereMat[mat];//material billboard
		sphereArray[i][j][5].visible = true;//enable raycast
		clusterFinder(i,j,mat);
		reloadSphere();
});
		tween.start();
}
//reload sphere-------------------------------------------------
function reloadSphere(){
		//prev sphere to aimsphere
		tweenSphere.position.x = prevSphere.position.x;
		tweenSphere.position.set(prevSphere.position.x, prevSphere.position.y, prevSphere.position.z);
		tweenSphere.material = prevSphere.material;
		tweenSphere.mat = prevSphere.mat;
		prevSphere.material = sphereMat[0];
			
var tween = new TWEEN.Tween(tweenSphere.position).to({
		x: aimSphere.position.x,
		y: aimSphere.position.y,
		z: aimSphere.position.z,
		}, 200)
		.onStart(function() {
		})
		.onComplete(function(){
		aimSphere.material = tweenSphere.material;
		aimSphere.mat = tweenSphere.mat;
		tweenSphere.material = sphereMat[0];
		
		if (mode=='time'){ //randomise sphere color if time mode
		var mat = randColor();
		} else {
		//pick predefined if puzzle mode
		var mat = puzzleArray[activPuzzle].stack[stackNbr];
		stackNbr++;
		if(stackNbr > puzzleArray[activPuzzle].stack.length) {gameOver();return;} //puzzle game over
		}
		prevSphere.material = sphereMat[mat];
		prevSphere.mat = mat;
		control.enabled = true;
var temp = 0;
  for(var j = 0; j < totalSpheres; j++){
		//game over
		if (sphereArray[totalRing-1][j][2] > 0){ warning.visible=false; gameOver(); return;}
		//warning state
		if (sphereArray[totalRing-2][j][2] > 0){warning.visible=true;}
		else {
		temp += sphereArray[totalRing-3][j][2];
		}
		}
		console.log(temp);
		//remove warning state if no bubbles found on lower ring
		if (temp === 0){warning.visible=false;}	
		});
	tween.start();
}
//get a random sphere color-------------------------------------------------
function randColor(){
    return Math.floor(Math.random()*(7-2+1)+2);
}
//display explosion-------------------------------------------------
function destroyAnim(){
	if(FXtime<7){
	sprite[9].offset.set( FXtime/7, 0 );
	FXtime++;
		}else{
			//stop interval
			clearTimeout(FXtimeout);
			//reset FX position
			for(var i = 0; i < 30; i++){
	destroyArray[i].position.x = 0;
	destroyArray[i].position.y = -500;
	destroyArray[i].position.z = 0;
	}	
		}
	}
//explosion positions-------------------------------------------------
function destroyPos(i,pi, pj, py){
	destroyArray[i].position.x = pi;
	destroyArray[i].position.y = py;
	destroyArray[i].position.z = pj;
}
//game over-------------------------------------------------
function gameOver(){
	//color remaining sphere in white
	for(var i = 1; i < totalRing; i++){
    for(var j = 0; j < totalSpheres; j++){
		if (sphereArray[i][j][2] > 0){
		sphereArray[i][j][2] = 8;
		sphereArray[i][j][4].material = sphereMat[8];
		}
		}
	}
pause();
updateInterface(5);	
}
