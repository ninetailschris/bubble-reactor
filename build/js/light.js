function drawLights(){
//basic directional light	
dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );

var d = 800;

dirLight.shadow.camera.right = d;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.top	= d;
dirLight.shadow.camera.bottom = -d;	
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 1200;

dirLight.color.setHSL( 0, 0, 1 );
dirLight.position.set( -1, 2, -1 );
dirLight.position.multiplyScalar( 150 );
	
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.0001;
	
scene.add( dirLight );
//scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );
}