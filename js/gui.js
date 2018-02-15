// GUI --------------------------------------------------------
/* exported iniGui, updateGuiInfo */

function initGui() {

	gui = new dat.GUI();
	gui.width = 270;

	gui_info = gui.addFolder( 'Info' );
	gui_info.add( neuralNet, 'numNeurons' ).name( 'Neurons' );
	gui_info.add( neuralNet, 'numAxons' ).name( 'Axons' );
	gui_info.add( neuralNet, 'numSignals', 0, neuralNet.settings.limitSignals ).name( 'Signals' );
	gui_info.autoListen = false;

	gui_settings = gui.addFolder( 'Settings Signals ' );
	gui_settings.add( neuralNet.settings, 'currentMaxSignals', 0, neuralNet.settings.limitSignals ).name( 'Max Signals' );
	gui_settings.add( neuralNet.particlePool, 'pSize', 0.2, 10 ).name( 'Signal Size' );
	gui_settings.add( neuralNet.settings, 'amountEmittedSignals', 1, 200 ).name( 'Amount Emitted Signals' );
	gui_settings.add( neuralNet.settings, 'signalMinSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Min Speed' );
	gui_settings.add( neuralNet.settings, 'signalMaxSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Max Speed' );
	gui_settings.addColor( neuralNet.particlePool, 'pColor' ).name( 'Signal Color' );
	gui_settings.add(  neuralNet.settings, 'trailSizeMult',0.0, 10.0, 0.01  ).name( 'Trail Size Mult' );
	gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );
	gui_settings.add( neuralNet, 'releaseSignal' ).name( 'Release Signal' );
	gui_settings.open();
	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}

	gui_settings = gui.addFolder( 'Settings Connections ' );
	gui_settings.add( neuralNet.settings, 'maxAxonDist', 0, 100 ).name( 'Max Distance' );
	gui_settings.add( neuralNet.settings, 'axonThickness', 0, 100 ).name( 'Axon Thickness' );
	gui_settings.add( neuralNet.settings, 'maxConnectionsPerNeuron', 0, 100 ).name( 'Max Connection Per Neuron' ).step(1);
	gui_settings.add( neuralNet, 'axonOpacityMultiplier', 0.0, 10.0 ).name( 'Axon Opacity Mult' );
	gui_settings.addColor( neuralNet, 'axonColor' ).name( 'Axon Color' );
	gui_settings.open();

	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}
	gui_settings = gui.addFolder( 'Settings Neurons' );
	gui_settings.add( neuralNet.settings, 'maxNeurons', 0, 10000 ).name( 'Max Neurons' ).step(1);
	gui_settings.add( neuralNet.settings, 'neuroSeed', 0, 1000 ).name( 'Neuro Seed' ).step(1);
	gui_settings.add( neuralNet.settings, 'noiseFreq', 0, 100 ).name( 'Noise Frequency' ).step(0.1);
	gui_settings.add( neuralNet, 'neuronSizeMultiplier', 0, 2 ).name( 'Neuron Size Mult' );
	gui_settings.add( neuralNet, 'neuronOpacity', 0, 1.0 ).name( 'Neuron Opacity' );
	gui_settings.addColor( neuralNet, 'neuronColor' ).name( 'Neuron Color' );
	gui_settings.add(neuralNet, 'createNetwork').name('Create Network');

	gui_info.open();
	gui_settings.open();

	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}

}

function updateNeuralNetworkSettings() {
	neuralNet.updateSettings();
	if ( neuralNet.settings.signalMinSpeed > neuralNet.settings.signalMaxSpeed ) {
		neuralNet.settings.signalMaxSpeed = neuralNet.settings.signalMinSpeed;
		gui_settings.__controllers[ 3 ].updateDisplay();
	}
}

function updateGuiInfo() {
	for ( var i = 0; i < gui_info.__controllers.length; i++ ) {
		gui_info.__controllers[ i ].updateDisplay();
	}
}
