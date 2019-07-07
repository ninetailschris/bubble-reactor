//	skyTex[i]= new THREE.MeshBasicMaterial({fog: false, side: THREE.BackSide, map: textureLoader.load(img_url[i])});

function drawSkybox() {
  // model
  var loader = new THREE.FBXLoader();
  loader.load('model/ocean.fbx', function(object) {
    object.position.y = -40;
    for(var i = 0; i < object.children.length; i++){
    object.children[i].material.fog = false;
    object.children[i].material.side = THREE.DoubleSide;
    }
    scene.add(object);
  });
}