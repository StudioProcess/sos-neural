// Run --------------------------------------------------------

function update() {

	updateHelpers();

	if ( !sceneSettings.pause ) {

		var deltaTime = clock.getDelta();
		neuralNet.update( deltaTime );
;
		updateGuiInfo();

	}

}



// ----  draw loop
function run() {

	requestAnimationFrame( run );
	
	// render trails 

	update();


 	if (do_render){

	    renderer.setClearColor( sceneSettings.bgColor, 1 );
		//rendererNet.render( sceneTrail, camera );
		renderer.render( scene, camera );
	}
	stats.update();
	FRAME_COUNT ++;

}
