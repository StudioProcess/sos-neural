// Run --------------------------------------------------------

function update() {

	updateHelpers();

	if ( !sceneSettings.pause ) {

		// var deltaTime = clock.getDelta();
		var deltaTime = 1.0 / 30.0;
		neuralNet.update( deltaTime );
;
		updateGuiInfo();

	}

}



// ----  draw loop
var frameID;
function run() {
	cancelAnimationFrame(frameID);
	frameID = requestAnimationFrame( run );

	// render trails

	update();


 	if (do_render){
			scene.rotation.z += Math.PI / 180 * 0.01;
			scene.rotation.y += Math.PI / 180 * 0.001;
	    renderer.setClearColor( sceneSettings.bgColor, 1 );
		//rendererNet.render( sceneTrail, camera );
		renderer.render( scene, camera );
		updateCapture( renderer );
	}
	stats.update();
	FRAME_COUNT ++;

}
