// Neural Network --------------------------------------------------------

function NeuralNetwork() {

	this.initialized = false;

	this.settings = {
		/*default
		verticesSkipStep       : 2,
		maxAxonDist            : 10,
		maxConnectionsPerNeuron: 6,
		signalMinSpeed         : 1.75,
		signalMaxSpeed         : 3.25,
		currentMaxSignals      : 3000,
		limitSignals           : 10000
		*/

		verticesSkipStep: SETTINGS.verticesSkipStep,
		maxAxonDist: SETTINGS.maxAxonDist,
		// axonThickness: 2,
		maxConnectionsPerNeuron: SETTINGS.maxConnectionsPerNeuron,
		amountEmittedSignals: SETTINGS.amountEmittedSignals,
		signalMinSpeed: SETTINGS.signalMinSpeed,
		signalMaxSpeed: SETTINGS.signalMaxSpeed,
		currentMaxSignals: SETTINGS.currentMaxSignals,
		limitSignals: SETTINGS.limitSignals,
		maxNeurons: SETTINGS.maxNeurons,
		neuroSeed: SETTINGS.neuroSeed,
		noiseFreq: SETTINGS.noiseFreq,
		trailSizeMult: SETTINGS.trailSizeMult,
		trailLength: SETTINGS.trailLength,
		trailHeadOpacity: SETTINGS.trailHeadOpacity,
		trailTailOpacity: SETTINGS.trailTailOpacity,
		xMax: SETTINGS.xMax,
		yMax: SETTINGS.yMax,
		zMax: SETTINGS.zMax,
	};

	this.createNetwork();

}



NeuralNetwork.prototype.createNetwork = function () {
	Math.seedrandom(this.settings.neuroSeed);
	
	this.initialized = false;

	if( this.meshComponents)
		scene.remove( this.meshComponents );


	this.meshComponents = new THREE.Object3D();
	this.trailComponets = new THREE.Object3D();
	this.particlePool = new ParticlePool( this.settings.limitSignals );
	this.meshComponents.add( this.particlePool.meshComponents );

	// NN component containers
	this.components = {
		neurons: [],
		allSignals: [],
		allAxons: []
	};

	// axon
	this.axonOpacityMultiplier = SETTINGS.axonOpacityMultiplier;
	this.axonLineWeight = SETTINGS.axonLineWeight;
	this.axonColor = SETTINGS.axonColor;
	this.axonGeom = new THREE.InstancedBufferGeometry();
	this.axonPositions = [];
	this.axonEndPositions = [];
	this.axonEndPositions = [];
	this.axonIndices = [];
	this.axonNextPositionsIndex = 0;

	this.axonUniforms = {
		color: {
			type: 'c',
			value: new THREE.Color( this.axonColor )
		},
		opacityMultiplier: {
			type: 'f',
			value: this.axonOpacityMultiplier
		},
		axonLineWeight: {
			type: 'f',
			value: this.axonLineWeight
		}
	};

	this.axonAttributes = {
		opacity: {
			type: 'f',
			value: []
		}
	};

	// neuron
	this.neuronSizeMultiplier = SETTINGS.neuronSizeMultiplier;
	this.spriteTextureNeuron = TEXTURES.electric;
	this.neuronColor = SETTINGS.neuronColor;
	this.neuronOpacity = SETTINGS.neuronOpacity;
	this.neuronsGeom = new THREE.BufferGeometry();

	this.neuronUniforms = {
		sizeMultiplier: {
			type: 'f',
			value: this.neuronSizeMultiplier
		},
		opacity: {
			type: 'f',
			value: this.neuronOpacity
		},
		texture: {
			type: 't',
			value: this.spriteTextureNeuron
		}
	};



	this.neuronShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.neuronUniforms,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false

	} );


	//signals
	this.initialReleasePosition = new THREE.Vector3();

	// info api
	this.numNeurons = 0;
	this.numAxons = 0;
	this.numSignals = 0;

	this.numPassive = 0;


	// initialize NN
	this.initNeuralNetwork();


	sceneTrail.add( this.trailComponets);
	scene.add( this.meshComponents );

};

NeuralNetwork.prototype.createVertices = function () {

	var neurons  = new Array(this.settings.maxNeurons);

	var currentAmount = 0
	// noise.seed(this.settings.neuroSeed);
	var xMax = this.settings.xMax;
	var yMax = this.settings.yMax;
	var zMax = this.settings.zMax;

	var probability = 0.0 // probability to choose a vertex //it depends on the noise used
	var unsuccessfullLoops = 0
	while( currentAmount < this.settings.maxNeurons){

		xRandom = Math.random();
		yRandom = Math.random();
		zRandom = Math.random();

		probability = Math.abs(noise.perlin3(xRandom*this.settings.noiseFreq,yRandom*this.settings.noiseFreq,zRandom*this.settings.noiseFreq))

		if(probability > 0.95 - (unsuccessfullLoops/10000000.0)){ // this could be a Random range
			xPos = (0.5 - xRandom) * xMax;
			yPos = (0.5 - yRandom) * yMax;
			zPos = (0.5 - zRandom) * zMax;
			neurons[currentAmount] = new THREE.Vector3(xPos, yPos, zPos);
			currentAmount++;

		}else{
			unsuccessfullLoops++;
		}


	}


	return neurons;

};

NeuralNetwork.prototype.initNeuralNetwork = function () {

	vertice = this.createVertices();


	this.initNeurons( vertice );
	this.initAxons();

	this.neuronShaderMaterial.vertexShader = SHADER_CONTAINER.neuronVert;
	this.neuronShaderMaterial.fragmentShader = SHADER_CONTAINER.neuronFrag;

	this.axonShaderMaterial.vertexShader = SHADER_CONTAINER.axonVert;
	this.axonShaderMaterial.fragmentShader = SHADER_CONTAINER.axonFrag;

	this.initialized = true;

};

NeuralNetwork.prototype.initNeurons = function ( inputVertices ) {

	var positions = [];
	var colors = [];
	var size = [];
	var color = new THREE.Color( '#ffffff' );


	var i;
	for ( i = 0; i < inputVertices.length; i++ ) {
		var pos = inputVertices[ i ];
		var n = new Neuron( pos.x, pos.y, pos.z );
		this.components.neurons.push( n );
		positions.push( pos.x, pos.y, pos.z );
		colors.push(color.r,color.g,color.b); // initial neuron color
		size.push( THREE.Math.randFloat( 0.75, 3.0 )); // initial neuron size
	}

	this.neuronsGeom.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	this.neuronsGeom.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).setDynamic( true )  );
	this.neuronsGeom.addAttribute( 'size', new THREE.Float32BufferAttribute( size, 1 ).setDynamic( true )  );


	// neuron mesh
	this.neuronParticles = new THREE.Points( this.neuronsGeom, this.neuronShaderMaterial );
	this.meshComponents.add( this.neuronParticles );

	this.neuronShaderMaterial.needsUpdate = true;

};

NeuralNetwork.prototype.initAxons = function () {

	console.log("check");

	var allNeuronsLength = this.components.neurons.length;
	for ( var j = 0; j < allNeuronsLength; j++ ) {
		var n1 = this.components.neurons[ j ];
		for ( var k = j + 1; k < allNeuronsLength; k++ ) {
			var n2 = this.components.neurons[ k ];
			// connect neuron if distance is within threshold and limit maximum connection per neuron
			if ( n1 !== n2 && n1.distanceTo( n2 ) < this.settings.maxAxonDist &&
				n1.connection.length < this.settings.maxConnectionsPerNeuron &&
				n2.connection.length < this.settings.maxConnectionsPerNeuron ) {
				var connectedAxon = n1.connectNeuronTo( n2 );
				this.constructAxonArrayBuffer( connectedAxon );
			}
		}
	}

	// enable WebGL 32 bit index buffer or get an error
	if ( !renderer.getContext().getExtension( "OES_element_index_uint" ) ) {
		console.error( "32bit index buffer not supported!" );
	}

	// var axonIndices = new Uint32Array( this.axonIndices );
	// var axonPositions = new Float32Array( this.axonPositions );
	// var axonEndPositions = new Float32Array( this.axonEndPositions );

	// console.log(this.axonIndices);

	// var startPositions = [];
	// var endPositions = [];

	// for (let i = 0, l = this.axonIndices.length; i < l; i++) {
	// 	const baseIndex = this.axonIndices[i] * 3;

	// 	for (let j = 0; j < 3; j++) {
	// 		startPositions.push(this.axonPositions[baseIndex + j]);
	// 		endPositions.push(this.axonEndPositions[baseIndex + j]);
	// 	}
	// }

	// var axonOpacities = new Float32Array( this.axonAttributes.opacity.value );

	this.axonGeom.addAttribute( 'positionStart', new THREE.InstancedBufferAttribute(new Float32Array(this.axonPositions), 3));
	this.axonGeom.addAttribute( 'positionEnd', new THREE.InstancedBufferAttribute(new Float32Array(this.axonEndPositions), 3));
	// this.axonGeom.addAttribute( 'positionStart', new THREE.InstancedBufferAttribute(new Float32Array([
	// 	-50.0, 0.0, 0.0,
	// 	0.0, -50.0, 0.0,
	// ]), 3));
	// this.axonGeom.addAttribute( 'positionEnd', new THREE.InstancedBufferAttribute(new Float32Array([
	// 	50.0, 0.0, 0.0,
	// 	0.0, 50.0, 0.0,
	// ]), 3));
	this.axonGeom.addAttribute( 'opacity', new THREE.InstancedBufferAttribute(new Float32Array( this.axonAttributes.opacity.value ), 1 ) );

	this.axonGeom.addAttribute("position", new THREE.BufferAttribute(new Float32Array([
		-1.0, 1.0, 1.0, // TL
		1.0, 1.0, 1.0, // TR
		1.0, -1.0, 0.0, // BR
		-1.0, -1.0, 0.0, // BL
	]), 3));
	this.axonGeom.setIndex(new THREE.BufferAttribute(new Uint16Array([
    0, 1, 3,
    3, 1, 2
  ]), 1));

	// console.log(this.axonGeom);

	// this.axonGeom.setIndex(  new THREE.BufferAttribute( axonIndices, 1 ) );
	// this.axonGeom.computeBoundingSphere();

	this.axonShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.axonUniforms,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		linewidth: this.settings.axonThickness,
		// wireframe: true,
	} );

	this.axonMesh = new THREE.Mesh( this.axonGeom, this.axonShaderMaterial );
	this.axonMesh.frustumCulled = false;
	this.meshComponents.add( this.axonMesh );


	var numNotConnected = 0;
	for ( i = 0; i < allNeuronsLength; i++ ) {
		if ( !this.components.neurons[ i ].connection[ 0 ] ) {
			numNotConnected += 1;
		}
	}
	console.log( 'numNotConnected =', numNotConnected );

};

NeuralNetwork.prototype.releaseSignal = function ( deltaTime ) {

		this.resetAllNeurons();
		selectedNeuron =  this.components.neurons[ THREE.Math.randInt( 0, this.components.neurons.length ) ];
		this.initialReleasePosition = selectedNeuron;
		for (var i =0; i < this.settings.amountEmittedSignals; i++) {
			this.releaseSignalAt( selectedNeuron);

		}



}


NeuralNetwork.prototype.update = function ( deltaTime ) {

	if ( !this.initialized ) return;

	var n, ii;
	var currentTime = Date.now();

	// update neurons state and release signal
	for ( ii = 0; ii < this.components.neurons.length; ii++ ) {

		n = this.components.neurons[ ii ];

		if ( this.components.allSignals.length < this.settings.currentMaxSignals - this.settings.maxConnectionsPerNeuron ) { // limit total signals currentMaxSignals - maxConnectionsPerNeuron because allSignals can not bigger than particlePool size

			// if ( n.receivedSignal && n.firedCount < 100 ) { // Traversal mode
			// if (n.receivedSignal && (currentTime - n.lastSignalRelease > n.releaseDelay) && n.firedCount < 8)  {	// Random mode
				if (n.receivedSignal && !n.fired )  {	// Single propagation mode
			// if (n.receivedSignal )  {	// Single propagation mode
				n.fired = true;
				n.lastSignalRelease = currentTime;
				n.releaseDelay = THREE.Math.randInt( 100, 1000 );
				this.releaseSignalAt( n );
			}

		}

		n.receivedSignal = false; // if neuron recieved signal but still in delay reset it
	}


	// update and remove dead signals
	for ( var j = this.components.allSignals.length - 1; j >= 0; j-- ) {
		var s = this.components.allSignals[ j ];
		s.travel( deltaTime );

		if ( !s.alive ) {
			s.particle.free();
			for ( var k = this.components.allSignals.length - 1; k >= 0; k-- ) {
				if ( s === this.components.allSignals[ k ] ) {
					this.components.allSignals.splice( k, 1 );
					break;
				}
			}
		}

	}

	// update particle pool vertices
	this.particlePool.update();

	// update info for GUI
	this.updateInfo();

};

NeuralNetwork.prototype.constructAxonArrayBuffer = function ( axon ) {
	this.components.allAxons.push( axon );
	var vertices = axon.vertices;

	for ( var i = 0; i < vertices.length; i++ ) {

		this.axonPositions.push( vertices[ i ].x, vertices[ i ].y, vertices[ i ].z );

		// also store other position
		this.axonEndPositions.push( vertices[ 1-i ].x, vertices[ 1-i ].y, vertices[ 1-i ].z );

		if ( i < vertices.length - 1 ) {
			var idx = this.axonNextPositionsIndex;
			this.axonIndices.push( idx, idx + 1 );

			var opacity = THREE.Math.randFloat( 0.005, 0.2 );
			this.axonAttributes.opacity.value.push( opacity, opacity );

		}

		this.axonNextPositionsIndex += 1;
	}
};

NeuralNetwork.prototype.releaseSignalAt = function ( neuron ) {
	var signals = neuron.createSignal( this.particlePool, this.settings.signalMinSpeed, this.settings.signalMaxSpeed );
	for ( var ii = 0; ii < signals.length; ii++ ) {
		var s = signals[ ii ];
		this.components.allSignals.push( s );
	}
};

NeuralNetwork.prototype.resetAllNeurons = function () {

	this.numPassive = 0;
	for ( var ii = 0; ii < this.components.neurons.length; ii++ ) { // reset all neuron state
		n = this.components.neurons[ ii ];

		if ( !n.fired ) {
			this.numPassive += 1;
		}

		n.reset();

	}
	// console.log( 'numPassive =', this.numPassive );

};

NeuralNetwork.prototype.updateInfo = function () {
	this.numNeurons = this.components.neurons.length;
	this.numAxons = this.components.allAxons.length;
	this.numSignals = this.components.allSignals.length;
};

NeuralNetwork.prototype.updateSettings = function () {

	this.neuronUniforms.opacity.value = this.neuronOpacity;
	var color = new THREE.Color(this.neuronColor);
	var colors = this.neuronsGeom.attributes.color.array;
	for ( i = 0; i <colors.length; i+=3 ) {
		colors[ i ] =  color.r ; // initial neuron color
		colors[ i+1 ] =  color.g ; // initial neuron color
		colors[ i+2 ] =  color.b ; // initial neuron color
	}
	this.neuronsGeom.attributes.color.needsUpdate = true;

	this.neuronUniforms.sizeMultiplier.value = this.neuronSizeMultiplier;

	this.axonUniforms.color.value.set( this.axonColor );
	this.axonUniforms.opacityMultiplier.value = this.axonOpacityMultiplier;
	this.axonUniforms.axonLineWeight.value = this.axonLineWeight;
	this.axonShaderMaterial.linewidth = this.settings.axonThickness;
	this.particlePool.updateSettings();
};

NeuralNetwork.prototype.testChangOpcAttr = function () {

	var opcArr = this.axonGeom.attributes.opacity.array;
	for ( var i = 0; i < opcArr.length; i++ ) {
		opcArr[ i ] = THREE.Math.randFloat( 0, 0.5 );
	}
	this.axonGeom.attributes.opacity.needsUpdate = true;
};
