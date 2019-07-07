var sprite = [];
var texture = [];
var annie;
function loadMaterials(){
//-------------TEXTURE LIST-----------------------------------------------
	var sprite_url = [
	'img/blank.png',//0 (empty space)
	'img/base.png',//1 (ring base)
	'img/red.png',//2
	'img/green.png',//3
	'img/blue.png',//4
	'img/yellow.png',//5
	'img/purple.png',//6
	'img/orange.png',//7
	'img/white.png',//8
	'img/destroy.png',//9
	];
	var texture_url = [
	'img/blank.png',//0 (empty space)
	'img/warning.png',//1
	];
	//sprite loader
		for ( var i = 0; i <sprite_url.length; i ++ ) {
		sprite[i]=spriteLoader.load(sprite_url[i]);
		}
		sprite[9].wrapS = THREE.RepeatWrapping;
		sprite[9].wrapT = THREE.RepeatWrapping;
		sprite[9].offset.set( 0, 0 );
		sprite[9].repeat.set( 1/7, 1/1 );
	//texture loader
		for ( var j = 0; j <texture_url.length; j ++ ) {
		texture[j]=textureLoader.load(texture_url[j]);
		}
		texture[1].wrapS = THREE.RepeatWrapping;
		texture[1].wrapT = THREE.RepeatWrapping;
		texture[1].repeat.set( 3, 1 );
}