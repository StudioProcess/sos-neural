// Scene --------------------------------------------------------
/* exported updateHelpers */

if ( !Detector.webgl ) {
	Detector.addGetWebGLMessage();
}

var container, stats;
var scene, light, camera, cameraCtrl, renderer, renderTarget, sceneTrail;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
var screenRatio = WIDTH / HEIGHT;
var clock = new THREE.Clock();
var FRAME_COUNT = 0;

// ---- Settings
var sceneSettings = {

	pause: false,
	bgColor: 0x111113,
	trailClearColor: 0x111113,
	enableGridHelper: false,
	enableAxisHelper: false

};

// ---- Scene
container = document.getElementById( 'canvas-container' );
scene = new THREE.Scene();
sceneTrail = new THREE.Scene();
sceneScreen = new THREE.Scene();

// ---- Camera
camera = new THREE.PerspectiveCamera( 75, screenRatio, 10, 5000 );
// camera orbit control
cameraCtrl = new THREE.OrbitControls( camera, container );
cameraCtrl.object.position.z = 150;
cameraCtrl.update();

// ---- Renderer
renderer = new THREE.WebGLRenderer( {
	antialias: true,
	alpha: true,
	preserveDrawingBuffer: true
} );
WIDTH = 1280;
HEIGHT = 800;
renderer.setSize( WIDTH, HEIGHT );
renderer.setPixelRatio( 2 );
renderer.setClearColor( sceneSettings.bgColor, 1 );
//renderer.autoClear = false;
container.appendChild( renderer.domElement );



// ---- Stats
// stats = new Stats();
// container.appendChild( stats.domElement );

// ---- grid & axis helper


circlePoints = [];
var twoPI = Math.PI * 2;
var index = 0;
var scale = 0.1;
var inc = twoPI / 16.0;
for ( var i = 0; i <= twoPI + inc; i+= inc )  {
	var vector = new THREE.Vector3();
	vector.set( 0, Math.cos( i ) * scale, Math.sin( i ) * scale );
	circlePoints[ index ] = vector;
	index ++;
}
do_render = true;
TILES = 2;


document.addEventListener('keydown', function(e) {
	if (e.key == 'f') { // f .. fullscreen
		if (!document.webkitFullscreenElement) {
			document.querySelector('body').webkitRequestFullscreen();
		} else { document.webkitExitFullscreen(); }
	}
  else if (e.key == ' ') {
    console.log('space');
    do_render = !do_render;
  } else if (e.key == 'e') {
    saveTiles(renderer, scene, camera, TILES);
  } else if (e.key == 'c') {
    startstopCapture(); // start/stop recording
  }
  else if (e.key == 'v') {
    startstopCapture( {startTime:0, timeLimit:1} ); // record 1 second
  }
});

function updateHelpers() {
}

/*
// ---- Lights
// back light
light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( 100, 230, -100 );
scene.add( light );

// hemi
light = new THREE.HemisphereLight( 0x00ffff, 0x29295e, 1 );
light.position.set( 370, 200, 20 );
scene.add( light );

// ambient
light = new THREE.AmbientLight( 0x111111 );
scene.add( light );
*/
