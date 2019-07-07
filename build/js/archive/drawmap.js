// ThreeTactics engine
// by MKLB
// project@mklb.ch


//-----------------------------------------------------------
//about optimisation process
//-----------------------------------------------------------

//all the mesh URL can be found in "models.js"
//each mesh is used multiple time with different texture and rotation.
//the map is made of 10 geometry objects = 10 different heights with 10 different textures
//Water is added in another geometry to apply waterfall effect
//characters and panels are not merged to keep interactivity.

//-----------------------------------------------------------
//GLOBAL VARIABLES
//-----------------------------------------------------------
//model to use in the current map
var usedModel=[];
//total of model to load
var totalLoad=0;
// model loaded
var totalCheck=0;
//garbage collector
var loadList=[];
//character used in the scene
var charList=[];
//panel to draw
var panelList=[];
//pathfinder result
var tweenList=[];
//variable to activate transparency depth sorting on specific objects (threex.transparency.js)
var transp=0;
//-----------------------------------------------------------
//DRAW THE SKYBOX
//-----------------------------------------------------------
function drawSky(){
	jsonLoader.load('models/cube.js', function( geometry ) {skyMesh(geometry);});
	}
function skyMesh(geometry){
	skyBox = new THREE.Mesh( geometry,materials[0] );
	skyBox.scale.set(90,90,90);
	scene.add(skyBox);
	randWeather();
	}

//first we need an array with 10 empty geometry.
var mapGeom=[];
for ( var i = 0; i < mapY; i ++ ) {
mapGeom[i] = new THREE.Geometry();
}
//empty geometry for the water
var waterGeom = new THREE.Geometry();
//empty geometry for the wall
var wallGeom = new THREE.Geometry();
//empty geometry for decoration and obstacles (rock or other)
var decoGeom = new THREE.Geometry();

//the next step is to load only the models we need for the current map
//for this we use the full 3d model list and compare it with the current map.
//-----------------------------------------------------------
//DRAW MAP
//-----------------------------------------------------------
function DrawMap(){
	//the tileset used by the map
	tileSet=mapList[mapNumber].tileset;
	//"m" is the index array number:the first is 0
	var m=0;
	//declare the map we use (oustside the loop)
	var targetMap;
	//The main loop: we take each model one by one.
	for ( var modelNbr = 0; modelNbr <model_url.length; modelNbr ++ ) {
		//find wich instance use it
		for ( var k = 0; k < instanceList.length; k ++ ) {
			//instances using same models are stored together
			//we create a new array in usedModel to store them
			usedModel[m]=[];
			//if the instance use the model----------------------
			if (instanceList[k].model==modelNbr){
				//what type is it?
				if (instanceList[k].mTile=="map" || instanceList[k].mTile=="water"){//this is a landscape (walkable)
					targetMap= mapList[mapNumber].Tm;
				}
				if (instanceList[k].mTile=="wall"){//this is a wall (non walkable)
					targetMap= mapList[mapNumber].Wm;
				}
				//is the instance used in the current map?
				for ( var i = 0; i < map_width; i ++ ) {
					for ( var j = 0; j < map_width; j ++ ) {
						//if true we create a javascript object with the position of the tile
						if (targetMap[i][j]==instanceList[k].mNumber){
							//console.log(k+"-" +m);
							usedModel[m].push({
							mNumber:k,//the instance number,
							i:i,//vertical position on current map
							j:j//horizontal position on current map
							});
						}
					}
				}
			}//end of instance check
			//if the array is not empty...
			if (usedModel[m].length>0){
			//...we create another array for the next instance check
				m++;
			} else if ( k > model_url.length){
			//if the last checked array is empty
			//we remove the unused element
				usedModel.pop();
			}
			
		}//all instances have been checked
	}
	//time to load the 3d models
	//for each type of instance present in the map we will load the coresponding 3d model
	for ( var r = 0; r <usedModel.length; r ++ ) {
		//calculate the total of instances to load
		totalLoad+=usedModel[r].length;
		//here we go!
		modelLoad(r);
		}
}
//-----------------------------------------------------------
//load models
//-----------------------------------------------------------
function modelLoad (r){
//search the tile of the instance. We use the first element to do this (all elements in the same array got the same number anyway)
var i = usedModel[r][0].mNumber;
//search the url of the 3d model assigned to it	
var j =instanceList[i].model;
//load it ....we pass the "r" variable (r=position of the instance on the map) all the way to the JsonLoader.
jsonLoader.load( model_url[j], function( geometry ) {addMesh(geometry,r);});
}
//-----------------------------------------------------------
//Draw models
//-----------------------------------------------------------
//"geometry" is the content of the Json 3d model
// "r" is the position and rotation specified inside the instance object
function addMesh(geometry,r){
	//new empty mesh
	var mesh;
	//number of mesh we need
	for ( var i = 0; i <usedModel[r].length; i ++ ) {
    //new mesh 
		mesh = new THREE.Mesh(geometry);
		//apply properties
		mesh.position.x = usedModel[r][i].j* cube_width-map_center;
		mesh.position.y = mapList[mapNumber].Hm [usedModel[r][i].i][usedModel[r][i].j]*cube_height-cube_height;
		mesh.position.z = usedModel[r][i].i* cube_width-map_center;
		mesh.rotation.y = instanceList[usedModel[r][i].mNumber].mRot * Math.PI / 180;
		//the height of the tile
		var mapHeight= mapList[mapNumber].Hm [usedModel[r][i].i][usedModel[r][i].j];
		//scaling the tile if it's a landscape tile
			if (instanceList[usedModel[r][i].mNumber].mTile=="map"){
				mesh.scale.set(1,mapHeight,1);
			}
		//merge all mesh together to obtain a single 3d object with a single texture (huge optimization)
		//these two lines below are a necessary step for three.js merge functionality
		mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();
		//if landscape type merge it in mapGeom
		if (instanceList[usedModel[r][i].mNumber].mTile=="map"){
			mapGeom[mapHeight].merge( mesh.geometry, mesh.matrix );
			}
		//if water type merge it in waterGeom
		if (instanceList[usedModel[r][i].mNumber].mTile=="water"){
			waterGeom.merge( mesh.geometry, mesh.matrix );
		}
		//if wall type merge it in wallGeom
		if (instanceList[usedModel[r][i].mNumber].mTile=="wall"){
			wallGeom.merge( mesh.geometry, mesh.matrix );
		}
		//loader counter
		totalCheck ++;
	}
	//check if everything is loaded
	if (totalCheck==totalLoad){
		usedModel=[];
		totalCheck=0;
		totalLoad=0;
		endCheck();
	}
}
// add everything to the scene when the loading is done
function endCheck(){
	//temporary variable to store geometry
	var tempGeom
	//landscape
	//-------------
	for ( i=0;i<mapGeom.length;i++){
	//tricky way to assign materials/tileset by height of tiles
	tempGeom = new THREE.Mesh(mapGeom[i],materials[tileArray[tileSet]+i-1]);
	tempGeom.castShadow = true;
	tempGeom.receiveShadow = true;
	
	//push it in the garbage collector list
	loadList.push(tempGeom);
	//add geometry to the scene
	scene.add(tempGeom);
	mapGeom[i]=[];
}
	//water
	//-------------
	tempGeom  = new THREE.Mesh(waterGeom,materials[6]);
	loadList.push(tempGeom);
	scene.add(tempGeom);
	waterGeom=[];
	
	//wall
	//-------------
	tempGeom  = new THREE.Mesh(wallGeom,materials[25]);
	tempGeom.castShadow = true;
	tempGeom.receiveShadow = true;
	loadList.push(tempGeom);
	scene.add(tempGeom);

$( ".loadcircle" ).hide();
$( ".loader" ).fadeOut(1000);
}

//-----------------------------------------------------------
//DRAW SQUAD SELECTION
//-----------------------------------------------------------

function drawSquad(){
		jsonLoader.load( model_url[6], function( geometry ) {addSquad(geometry);});
}
function addSquad(geometry){
	for ( var i = 0; i < 3; i ++ ) {
		for ( var j = 0; j <2; j ++ ) {
				
				mesh = new THREE.Mesh( geometry,materials[7] );
				mesh.position.x = j* cube_width-(cube_width-(cube_width/2));
				mesh.position.y = 0;
				mesh.position.z = i* cube_width-((cube_width*3/2)-(cube_width/2));
			loadList.push(mesh);
				scene.add(mesh);
		}
	}
}

//-----------------------------------------------------------
//DRAW STORYMAP
//-----------------------------------------------------------

function DrawWorld(){
// load a resource
jsonLoader.load(model_url[1],
	// Function when resource is loaded
	function ( geometry) {
		mesh = new THREE.Mesh( geometry,tx[56] );
		mesh.scale.set(100,100,100);
		loadList.push(mesh);
		scene.add( mesh );
	}
);
$( ".loadcircle" ).hide();
$( ".loader" ).fadeOut(1000);	
//testing light torch
//var light = new THREE.PointLight( 0xffffff, 2, 100 );
//light.position.set( 0, 1, 1 );
//loadList.push(light);
//scene.add( light );
}
//-----------------------------------------------------------
//PANEL DRAW
//-----------------------------------------------------------
function drawPanel(ri,rj,rClass){
	
		jsonLoader.load( model_url[1], function( geometry ) {addPanel(geometry,ri,rj,rClass);});
}
function addPanel(geometry,ri,rj,rClass){
//start the range grid (maybe outside map)
var pathI=ri-5; // 5= half the range array
var pathJ=rj-5;
// 11=total range array size
	for ( var i = 0; i < 11; i ++ ) {
		for ( var j = 0; j <11; j ++ ) {
				
			if (
				//if inside map boundaries
				i+pathI>=0 &&
				i+pathI<=map_width-1 &&
				j+pathJ>=0 &&
				j+pathJ<=map_width-1 &&
				//if target range is walkable and if no obstacle
				rangeList[rClass][i][j]>0 &&
				mapList[mapNumber].Wm[i+pathI][j+pathJ]===0
			) {
				//draw a panel
				mesh = new THREE.Mesh( geometry,tx[31] );
				mesh.position.x = (pathJ+j)* cube_width-map_center;
				mesh.position.y = mapList[mapNumber].Hm[pathI+i][pathJ+j]*cube_height-cube_height+0.2;
				mesh.position.z = (pathI+i)* cube_width-map_center;	
				panelList.push(mesh);
				scene.add(mesh);
			}	
		}
	}
	THREEx.Transparency.init(panelList)
	transp=1;
}
function removePanel(){
for (var i=0;i<panelList.length;i++){
	  scene.remove(panelList[i]);
    panelList[i].geometry.dispose();
    delete(panelList[i]);
}
	panelList=[];
	switchPanel=false;
	transp=0;
}
