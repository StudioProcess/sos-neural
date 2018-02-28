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
function run( time ) {
	let angle = (time/1000 / SETTINGS.loop_period) * 2*Math.PI;
	cancelAnimationFrame(frameID);
	frameID = requestAnimationFrame( run );
	update();

 	if (do_render){
		scene.rotation.z = Math.sin( angle ) * 0.01;
		scene.rotation.y = Math.cos( angle ) * 0.01;

    renderer.setClearColor( sceneSettings.bgColor, 1 );
		renderer.render( scene, camera );
		recorder.update( renderer );
	}
	// stats.update();
	FRAME_COUNT ++;

}
