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
let radius = 100;
let loop_period = 5;
function run( time ) {
	let angle = (time/1000 / loop_period) * 2*Math.PI;
	cancelAnimationFrame(frameID);
	frameID = requestAnimationFrame( run );

	// render trails

	update();


 	if (do_render){
			// scene.rotation.z += Math.PI / 180 * 0.01;
			// scene.rotation.y += Math.PI / 180 * 0.001;

			scene.rotation.z = Math.sin( angle ) * 0.1;
			scene.rotation.y = Math.cos( angle ) * 0.1;

			//
			// cameraCtrl.object.position.x = cos( * r);
			// cameraCtrl.object.position.x = sin(winkel * r);

	    renderer.setClearColor( sceneSettings.bgColor, 1 );
		//rendererNet.render( sceneTrail, camera );
		renderer.render( scene, camera );
		recorder.update( renderer );
	}
	// stats.update();
	FRAME_COUNT ++;

}
