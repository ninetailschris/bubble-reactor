var sound = [];

function loadSounds(){
//-------------SOUND LIST-----------------------------------------------
	var sound_url = [
	'sound/impact.wav',//0
	'sound/pop.wav',//1
	'sound/ring.wav',//2
	'sound/throw.mp3',//3	
	];
	//texture loader
	var textureLoader = new THREE.TextureLoader();
	//sky texture (custom backside shadowless shader)
		for ( var i = 0; i <sound_url.length; i ++ ) {
		sound[i]=new Howl({src: [sound_url[i]],volume: 0.2});
	}
}