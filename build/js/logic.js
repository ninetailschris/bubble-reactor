var	intervDestroy;
////variable to check if function still running
var	running = 0;
var map = [];
//------------------------------------------------------------
//cluster finder function
//------------------------------------------------------------
function clusterFinder(i,j,mat){
	running ++;
	//variable to check if a sphere is found
	var z = 0;
	//Define Odd or Even ring
	if (i&1){var r = 0;}else{var r = 1;};
	
	for ( var k = 0; k < neighborOffset[r].length; k ++ ) {
	//combine offset with target position
	var oi = i + neighborOffset[r][k][0];
	var oj = j + neighborOffset[r][k][1];
	//puzzle cylinder fix		
	if (oj == totalSpheres){ oj = 0;}
	 if (oj == -1){ oj = totalSpheres-1;}

	for ( var mi = 0; mi < totalRing; mi ++ ) {
		for ( var mj = 0; mj < totalSpheres; mj ++ ) {	
	
		if (mi == oi && mj == oj ){
			//if not checked
			if (sphereArray[mi][mj][3] === 0){
				//if color is the same
			if (sphereArray[mi][mj][2] == mat){
				//store in the cluster 
				clusterColor.push([mi, mj,0]);
				sphereArray[mi][mj][3] = 1;
				z++;
			}
		}
	}	
}
}	//Look for neighbor-------------------------------------------
}
if (z>0){ //new sphere has been found
	for (var m = 0; m < clusterColor.length; m ++ ) {
		//find neighbour for sphere inside cluster who are not yet checked
		if(clusterColor[m][2] === 0){
		clusterFinder(clusterColor[m][0],clusterColor[m][1],mat);
		//make sphere checked (no need to check again)	
		clusterColor[m][2]= 1;
		}
	}
}
onready();
}//end

//cluster finder running check
//------------------------------------------------------------
function onready() {
running--;
	if(running === 0) {//cluster search is over
		//reset check variable
	for(var i = 0; i < totalRing; i++){
    for(var j = 0; j < totalSpheres; j++){
		sphereArray[i][j][3] = 0;
		}
	}		
	//if >3 sphere of the same color	
	if (clusterColor.length > 2){
	destroySphere();
	clusterColor=[];
	searchIsland();
	 //if island detected	
	if (clusterColor.length > 0){
	destroySphere();	
	}
	FXtime = 1;
	FXtimeout = setInterval(destroyAnim,30);
	}
	//reset cluster
	clusterColor =[];
		}
	}
//destroy sphere + cleaning
//------------------------------------------------------------
function destroySphere(){
for (var i = 0; i < clusterColor.length; i ++ ) {
	var ci = clusterColor[i][0];
	var cj = clusterColor[i][1];
	//reset color info
	sphereArray[ci][cj][2] = 0;
	//transparent color
	sphereArray[ci][cj][4].material = sphereMat[0];
	//disable raycast
	sphereArray[ci][cj][5].visible = false;
	
	//get sphere position
	var pi = sphereArray[ci][cj][0];
	var pj = sphereArray[ci][cj][1];
	var py = gap*ci+offset;
	//display FX
	destroyPos (i,pi, pj, py);
}
	sound[1].play();
}
//search island
//------------------------------------------------------------
function searchIsland(){
	//create a map of current puzzle
	map = [];
	for(var i = 0; i < totalRing; i++){
		map[i] = [];
		for(var j = 0; j < totalSpheres; j++){
		if (sphereArray[i][j][2] > 0){
		map[i][j] = 1; // sphere
		} else{map[i][j] = 0;} // blank space
	}
}	//refill map while removing island
		fill(map, 0, 0, 2);
	for(var i = 0; i < totalRing; i++){
    for(var j = 0; j < totalSpheres; j++){
		//if sphere is on an island push it inside cluster
		if(map[i][j] == 1){
			clusterColor.push([i,j]);
			}
		}
}
}
//fill flood: six way (toggle) non-recursive method
//OMG how I am supposed to fix this???
//------------------------------------------------------------
function fill(data, x, y, newValue) {	
    // get target value
    var target = data[x][y];
    function flow(x,y) {
		if (x&1){var r = 0;}else{var r = 1;}; //toggle
        // bounds check what we were passed
        if (x >= 0 && x < data.length && y >= 0 && y < data[x].length) {
            if (data[x][y] === target) {
                data[x][y] = newValue;
                flow(x-1, y);// up
                flow(x+1, y);// down
                flow(x, y-1);// left
                flow(x, y+1);// right
			if (r === 0) {
				flow(x-1, y+1);// up right
				flow(x+1, y+1);// down right
			}else{
				flow(x-1, y-1);// up left
				flow(x+1, y-1);// down left

			}
            }
        }
    }
    
    flow(x,y);
}
