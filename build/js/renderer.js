//-----------------------------------------------------------
//ANIMATE
//-----------------------------------------------------------
function render(){
	//stats
	stats.update();
	rendererStats.update(renderer);
	//keydrown tick
	if ( control.enabled ) {
    kd.tick();
	}
	//camera auto rotation
	if ( autoRot.enabled ) {
		cameraRot();
	}
	//moving texture
	texture[1].offset.x+= 0.005;
	//tween update
	TWEEN.update();
	//rendering with basic camera
	renderer.render( scene, camera );
	//run three.js
	requestAnimationFrame( render );
}