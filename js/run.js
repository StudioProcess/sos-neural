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

	    renderer.setClearColor( sceneSettings.bgColor, 1 );
		//rendererNet.render( sceneTrail, camera );
		renderer.render( scene, camera );
		updateCapture( renderer );
	}
	stats.update();
	FRAME_COUNT ++;

}
