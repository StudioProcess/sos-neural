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



    renderer.setClearColor( sceneSettings.bgColor, 1 );
    renderer.clear();
	

	//renderer.render( sceneTrail, camera );
	renderer.render( scene, camera );

	stats.update();
	FRAME_COUNT ++;

}
