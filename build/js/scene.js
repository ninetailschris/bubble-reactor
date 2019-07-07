var scene,camera,controls,renderer;
var canvas = document.getElementById('canvas');
function drawScene(){
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 110, 150);
var screenWidth = window.innerWidth,screenHeight = window.innerHeight;
camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 95, 800 );
camFollow.push(camera);
scene.add(camera);

renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setClearColor( 0x000000, 0 );
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setPixelRatio( window.devicePixelRatio);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);  
//renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFShadowMap;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.autoClear = false;


container = document.getElementById( 'ThreeJS' );
container.appendChild( renderer.domElement );
window.addEventListener( 'resize', onWindowResize, false );  
  
}
//------------------------------------------------------------	
//WINDOW RESIZE
//------------------------------------------------------------
function onWindowResize(){
var container = document.getElementById('ThreeJS');
renderer.setSize($(container).width(), $(container).height());
container.appendChild(renderer.domElement);

var width =$(container).width();
var height =$(container).height();
camera.aspect = width / height;
camera.updateProjectionMatrix();  
}