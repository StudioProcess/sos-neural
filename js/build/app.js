!function(t){"use strict";var e=t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype,o=t.Blob&&function(){try{return Boolean(new Blob)}catch(t){return!1}}(),n=o&&t.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(t){return!1}}(),r=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||t.MSBlobBuilder,a=/^data:((.*?)(;charset=.*?)?)(;base64)?,/,i=(o||r)&&t.atob&&t.ArrayBuffer&&t.Uint8Array&&function(t){var e,i,l,u,c,f,b,d,B;if(!(e=t.match(a)))throw new Error("invalid data URI");for(i=e[2]?e[1]:"text/plain"+(e[3]||";charset=US-ASCII"),l=!!e[4],u=t.slice(e[0].length),c=l?atob(u):decodeURIComponent(u),f=new ArrayBuffer(c.length),b=new Uint8Array(f),d=0;d<c.length;d+=1)b[d]=c.charCodeAt(d);return o?new Blob([n?b:f],{type:i}):((B=new r).append(f),B.getBlob(i))};t.HTMLCanvasElement&&!e.toBlob&&(e.mozGetAsFile?e.toBlob=function(t,o,n){var r=this;setTimeout(function(){t(n&&e.toDataURL&&i?i(r.toDataURL(o,n)):r.mozGetAsFile("blob",o))})}:e.toDataURL&&i&&(e.toBlob=function(t,e,o){var n=this;setTimeout(function(){t(i(n.toDataURL(e,o)))})})),"function"==typeof define&&define.amd?define(function(){return i}):"object"==typeof module&&module.exports?module.exports=i:t.dataURLtoBlob=i}(window);
//# sourceMappingURL=canvas-to-blob.min.js.map
// Initial Settings 

var SETTINGS = {
	verticesSkipStep: 1,
	maxAxonDist: 9,
	// axonThickness: 2,
	maxConnectionsPerNeuron: 6,
	amountEmittedSignals: 2,
	signalMinSpeed: 2.7,
	signalMaxSpeed: 5.6,
	currentMaxSignals: 3000,
	limitSignals: 10000,
	maxNeurons: 1000,
	neuroSeed: 1000,
	noiseFreq: 90,
	trailSizeMult: 1.0,
	trailLength: 20,
	trailHeadOpacity: 0.6,
	trailTailOpacity: 0.1,
	xMax: 140,
	yMax: 90,
	zMax: 100,
	
	axonColor: '#97a9fa',
	axonLineWeight: 0.025,
	axonOpacityMultiplier: 0.5,
	
	// signals
	pColor: '#fff8c3',
	pSize: 0.3,
	
	//neuron
	neuronSizeMultiplier: 0.3,
	neuronColor: '#ffffff',
	neuronOpacity: 0.75,
	
	// scene
	bgColor: 0x111113,
	trailClearColor: 0x111113,
};

// Neuron ----------------------------------------------------------------

function Neuron( x, y, z ) {

	this.connection = [];
	this.receivedSignal = false;
	this.lastSignalRelease = 0;
	this.releaseDelay = 0;
	this.fired = false;
	this.firedCount = 0;
	this.prevReleaseAxon = null;
	THREE.Vector3.call( this, x, y, z );

}

Neuron.prototype = Object.create( THREE.Vector3.prototype );

Neuron.prototype.connectNeuronTo = function ( neuronB ) {

	var neuronA = this;
	// create axon and establish connection
	var axon = new Axon( neuronA, neuronB );
	neuronA.connection.push( new Connection( axon, 'A' ) );
	neuronB.connection.push( new Connection( axon, 'B' ) );
	return axon;

};

Neuron.prototype.createSignal = function ( particlePool, minSpeed, maxSpeed ) {

	this.receivedSignal = false;

	var signals = [];
	// create signal to all connected axons
	for ( var i = 0; i < this.connection.length; i++ ) {
		if ( this.connection[ i ].axon !== this.prevReleaseAxon ) {


			if( !this.equals(window.neuralNet.initialReleasePosition) ){
				// calculate direction from this signal
				pos =  this.connection[ i ].axon.getPoint( 0.5 ).clone(); // get the middle point, so it doesn't depend on the start point
				var directionNew = pos.sub(this);
				var directionFromInit = new THREE.Vector3().subVectors(this , window.neuralNet.initialReleasePosition);
				
				var angle = directionFromInit.angleTo(directionNew);

				if( angle < Math.PI/2.0){
					var c = new Signal( particlePool, minSpeed, maxSpeed );
					c.setConnection( this.connection[ i ] );
					signals.push( c );
					this.firedCount += 1;

				}

			}else{  // initial release
					var c = new Signal( particlePool, minSpeed, maxSpeed );
					c.setConnection( this.connection[ i ] );
					signals.push( c );
					this.firedCount += 1;

			}
		
		}
	}
	return signals;

};

Neuron.prototype.reset = function () {

	this.receivedSignal = false;
	this.lastSignalRelease = 0;
	this.releaseDelay = 0;
	this.fired = false;
	this.firedCount = 0;

};

// Signal extends THREE.Vector3 ----------------------------------------------------------------

const signalGeometry = new THREE.BufferGeometry();
signalGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array([
	-1.0, 1.0, 1.0, // TL
	1.0, 1.0, 1.0, // TR
	1.0, -1.0, 0.0, // BR
	-1.0, -1.0, 0.0, // BL
]), 3));
signalGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array([
	0, 1, 3,
	3, 1, 2
]), 1));

 function easeOutQuint(t) {
	t--;
	return (t*t*t*t*t + 1);
};

function easeOutCubic(t) {
	t--;
	return (t*t*t + 1);
};

function clamp(min, max, value) {
	if (value < min) {
		return min;
	} else if (value > max) {
		return max;
	}
	return value;
}

function inverseLerpClamped(
  a,
  b,
  value
) {
  return clamp(0.0, 1.0, (value - a) / (b - a));
}


function Signal( particlePool, minSpeed, maxSpeed ) {
	
	this.minSpeed = minSpeed;
	this.maxSpeed = maxSpeed;
	this.speed = THREE.Math.randFloat( this.minSpeed, this.maxSpeed );
	this.alive = true;
	this.t = null;
	this.startingPoint = null;
	this.axon = null;
	this.particle = particlePool.getParticle();
	THREE.Vector3.call( this );

	
	
	// create the trail renderer object
	this.trailRenderer = new THREE.TrailRenderer( scene, true );
	
	// create material for the trail renderer
	// var trailMaterial = THREE.TrailRenderer.createBaseMaterial();	
	var color = new THREE.Color(particlePool.pColor);
	var alphaHead  = neuralNet.settings.trailHeadOpacity;
	var alphaTail  = neuralNet.settings.trailTailOpacity;
	// trailMaterial.uniforms.headColor.value.set(color.r,color.g,color.b, alphaHead);
	// trailMaterial.uniforms.tailColor.value.set( color.r,color.g,color.b, alphaTail);
	// specify length of trail
	// var trailLength = neuralNet.settings.trailLength;
	
	this.uniforms = {
		positionStart: {type: "3fv", value: [-999.9, -999.9, -999.9]},
		positionEnd: {type: "3fv", value: [-999.9, -999.9, -999.9]},
		completion: {type: "f", value: 0.0},
		frontEdge: {type: "f", value: 0.0},
		fadeOut: {type: "f", value: 1.0},
		opacity: {type: "f", value: neuralNet.settings.trailHeadOpacity},
		lineWeight: {type: "f", value: neuralNet.axonLineWeight},
		color: {type:"3fv", value: [color.r,color.g,color.b]},
	};

	this.lineMaterial = new THREE.ShaderMaterial({
		vertexShader: SHADER_CONTAINER.signalVert,
		fragmentShader: SHADER_CONTAINER.signalFrag,
		uniforms: this.uniforms,
		blending: THREE.AdditiveBlending,
		transparent: true,
	});

	// var trailHeadGeometry = [];
	
	// for ( var i = 0; i < circlePoints.length; i++)  {
	// 	trailHeadGeometry.push( circlePoints[i].clone().multiplyScalar( neuralNet.settings.trailSizeMult));
	// }


	// trailHeadGeometry.push( 
	//   new THREE.Vector3( -0.1* neuralNet.settings.trailSizeMult, 0.0, 0.0 ), 
	//   new THREE.Vector3( 0.0* neuralNet.settings.trailSizeMul, 0.0, 0.0 ), 
	//   new THREE.Vector3( 0.1* neuralNet.settings.trailSizeMul, 0.0, 0.0 ) 
	// );	
	// initialize the trail
	// var geom = new THREE.Geometry();
	// geom.vertices.push(this.particle);
	// this.mesh = new THREE.Mesh(geom);
	// this.trailRenderer.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, this.mesh );
	// this.trailRenderer.activate();

	this.lineMesh = new THREE.Mesh(
		signalGeometry,
		this.lineMaterial
	);
	this.lineMesh.visible = false;
	scene.add(this.lineMesh);

	this.aboutToDie = false;
}

Signal.prototype = Object.create( THREE.Vector3.prototype );

Signal.prototype.setConnection = function ( Connection ) {

	// this.startingPoint = Connection.startingPoint;

	if (Connection.startingPoint === 'A') {
		this.uniforms.positionStart.value[0] = Connection.axon.neuronA.x;
		this.uniforms.positionStart.value[1] = Connection.axon.neuronA.y;
		this.uniforms.positionStart.value[2] = Connection.axon.neuronA.z;
	
		this.uniforms.positionEnd.value[0] = Connection.axon.neuronB.x;
		this.uniforms.positionEnd.value[1] = Connection.axon.neuronB.y;
		this.uniforms.positionEnd.value[2] = Connection.axon.neuronB.z;
	} else {
		this.uniforms.positionStart.value[0] = Connection.axon.neuronB.x;
		this.uniforms.positionStart.value[1] = Connection.axon.neuronB.y;
		this.uniforms.positionStart.value[2] = Connection.axon.neuronB.z;
	
		this.uniforms.positionEnd.value[0] = Connection.axon.neuronA.x;
		this.uniforms.positionEnd.value[1] = Connection.axon.neuronA.y;
		this.uniforms.positionEnd.value[2] = Connection.axon.neuronA.z;
	}

	// console.log(Connection.axon.neuronA.x);
	// console.log(Connection.axon.neuronB.x);
	// console.log(Connection.neuronA.x, Connection.neuronA.y, Connection.neuronA.z);
	// console.log(Connection.neuronB.x, Connection.neuronB.y, Connection.neuronB.z);

	this.lineMesh.visible = true;

	this.startingPoint = Connection.startingPoint;
	this.axon = Connection.axon;
	// if ( this.startingPoint === 'A' ) this.t = 0;
	// else if ( this.startingPoint === 'B' ) this.t = 1;
	this.t = 0.0;

};

Signal.prototype.travel = function ( deltaTime ) {



	// if( this.aboutToDie){
	// 	// this.trailRenderer.advance()
	// 	// this.trailRenderer.updateHead()
	// 	// this.lineMesh.visible = false;
	// 	return;
	// }

	// console.log(this.t);
	this.uniforms.completion.value = this.t;
	this.uniforms.frontEdge.value = this.t;//easeOutCubic(Math.min(1.0, this.t * 1.4));
	this.uniforms.fadeOut.value = inverseLerpClamped(2.0, 0.6, this.t);

	var pos;
	// if ( this.startingPoint === 'A' ) {
		this.t += this.speed * deltaTime;
		if ( this.t >= 1  ) {
			// this.t = 1;
			this.aboutToDie = true;
			this.axon.neuronB.receivedSignal = true;
			this.axon.neuronB.prevReleaseAxon = this.axon;
			var that = this;

			if ( this.t >= 2.0 ) {
				this.alive = false;
				this.lineMesh.visible = false;

			}
		}

	// }
	// else if ( this.startingPoint === 'B' ) {
	// 	this.t -= this.speed * deltaTime;
	// 	if ( this.t <= 0 ) {
	// 		this.t = 0;
	// 		this.aboutToDie = true;
	// 		this.axon.neuronA.receivedSignal = true;
	// 		this.axon.neuronA.prevReleaseAxon = this.axon;
	// 		var that = this;
	// 		setTimeout(function() {
	// 		        // that.trailRenderer.deactivate();
	// 		        that.alive = false;

	// 		    }, 1000);
	// 	}
	// }


	
	// pos = this.axon.getPoint( this.t );
	// pos = this.axon.getPointAt(this.t);	// uniform point distribution but slower calculation

	// this.particle.set( pos.x, pos.y, pos.z );
	// this.mesh.position.set(pos.x, pos.y, pos.z);
	// this.mesh.updateMatrixWorld();
	// this.trailRenderer.advance()
	// this.trailRenderer.updateHead()

};

// Particle Pool ---------------------------------------------------------

function ParticlePool( poolSize ) {

	this.spriteTextureSignal = TEXTURES.electric;

	this.poolSize = poolSize;
	this.pGeom = new THREE.Geometry();
	this.particles = this.pGeom.vertices;

	this.offScreenPos = new THREE.Vector3( 9999, 9999, 9999 );

	this.pColor = SETTINGS.pColor;
	this.pSize = SETTINGS.pSize;

	for ( var ii = 0; ii < this.poolSize; ii++ ) {
		this.particles[ ii ] = new Particle( this );
	}

	this.meshComponents = new THREE.Object3D();

	// inner particle
	this.pMat = new THREE.PointsMaterial( {
		map: this.spriteTextureSignal,
		size: this.pSize,
		color: this.pColor,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true
	} );


	this.pMesh = new THREE.Points( this.pGeom, this.pMat );
	this.pMesh.frustumCulled = false;

	this.meshComponents.add( this.pMesh );


	// outer particle glow
	this.pMat_outer = this.pMat.clone();
	this.pMat_outer.size = this.pSize * 1.5;
	this.pMat_outer.opacity = 0.04;

	this.pMesh_outer = new THREE.Points( this.pGeom, this.pMat_outer );
	this.pMesh_outer.frustumCulled = false;

	this.meshComponents.add( this.pMesh_outer );

}

ParticlePool.prototype.getAvgExecutionTime = function () {
	return this.profTime / this.itt;
};

ParticlePool.prototype.getParticle = function () {

	for ( var ii = 0; ii < this.poolSize; ii++ ) {
		var p = this.particles[ ii ];
		if ( p.available ) {
			this.lastAvailableIdx = ii;
			p.available = false;
			return p;
		}
	}

	console.error( "ParticlePool.prototype.getParticle return null" );
	return null;

};

ParticlePool.prototype.update = function () {

	this.pGeom.verticesNeedUpdate = true;

};

ParticlePool.prototype.updateSettings = function () {

	// inner particle
	this.pMat.color.setStyle( this.pColor );
	this.pMat.size = this.pSize;
	// outer particle
	this.pMat_outer.color.setStyle( this.pColor );
	this.pMat_outer.size = this.pSize * 1.5;

};

// Particle --------------------------------------------------------------
// Private class for particle pool

function Particle( particlePool ) {

	this.particlePool = particlePool;
	this.available = true;
	THREE.Vector3.call( this, this.particlePool.offScreenPos.x, this.particlePool.offScreenPos.y, this.particlePool.offScreenPos.z );

}

Particle.prototype = Object.create( THREE.Vector3.prototype );

Particle.prototype.free = function () {

	this.available = true;
	this.set( this.particlePool.offScreenPos.x, this.particlePool.offScreenPos.y, this.particlePool.offScreenPos.z );

};

// Axon extends THREE.CubicBezierCurve3 ------------------------------------------------------------------
/* exported Axon, Connection */

function Axon( neuronA, neuronB ) {

	this.bezierSubdivision = 1;
	this.neuronA = neuronA;
	this.neuronB = neuronB;
	//this.cpLength = neuronA.distanceTo( neuronB ) / THREE.Math.randFloat( 1.5, 4.0 );
	//this.controlPointA = this.getControlPoint( neuronA, neuronB );
	//this.controlPointB = this.getControlPoint( neuronB, neuronA );
	THREE.LineCurve3.call( this, this.neuronA,  this.neuronB );
	//THREE.CubicBezierCurve3.call( this, this.neuronA, this.controlPointA, this.controlPointB, this.neuronB );

	this.vertices = this.getSubdividedVertices();

}

Axon.prototype = Object.create( THREE.LineCurve3.prototype );

Axon.prototype.getSubdividedVertices = function () {
	return this.getSpacedPoints( this.bezierSubdivision );
};

// generate uniformly distribute vector within x-theta cone from arbitrary vector v1, v2
// Axon.prototype.getControlPoint = function ( v1, v2 ) {

// 	var dirVec = new THREE.Vector3().copy( v2 ).sub( v1 ).normalize();
// 	var northPole = new THREE.Vector3( 0, 0, 1 ); // this is original axis where point get sampled
// 	var axis = new THREE.Vector3().crossVectors( northPole, dirVec ).normalize(); // get axis of rotation from original axis to dirVec
// 	var axisTheta = dirVec.angleTo( northPole ); // get angle
// 	var rotMat = new THREE.Matrix4().makeRotationAxis( axis, axisTheta ); // build rotation matrix

// 	var minz = Math.cos( THREE.Math.degToRad( 45 ) ); // cone spread in degrees
// 	var z = THREE.Math.randFloat( minz, 1 );
// 	var theta = THREE.Math.randFloat( 0, Math.PI * 2 );
// 	var r = Math.sqrt( 1 - z * z );
// 	var cpPos = new THREE.Vector3( r * Math.cos( theta ), r * Math.sin( theta ), z );
// 	cpPos.multiplyScalar( this.cpLength ); // length of cpPoint
// 	cpPos.applyMatrix4( rotMat ); // rotate to dirVec
// 	cpPos.add( v1 ); // translate to v1
// 	return cpPos;

// };

// Connection ------------------------------------------------------------
function Connection( axon, startingPoint ) {
	this.axon = axon;
	this.startingPoint = startingPoint;
}

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

// Assets & Loaders --------------------------------------------------------

var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	document.getElementById( 'loading' ).style.display = 'none'; // hide loading animation when finished
	console.log( 'Done.' );

	main();

};


loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded + '/' + total, item );

};


var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	_.each( urlObj, function ( value, key ) {

		shaderLoader.load( value, function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		} );

	} );

};

var SHADER_CONTAINER = {};
shaderLoader.loadMultiple( SHADER_CONTAINER, {

	neuronVert: 'shaders/neuron.vert',
	neuronFrag: 'shaders/neuron.frag',

	axonVert: 'shaders/axon.vert',
	axonFrag: 'shaders/axon.frag',

	signalVert: 'shaders/signal.vert',
	signalFrag: 'shaders/signal.frag',

} );



// var OBJ_MODELS = {};
// var OBJloader = new THREE.OBJLoader( loadingManager );
// OBJloader.load( 'models/brain_vertex_low.obj', function ( model ) {

// 	OBJ_MODELS.brain = model.children[ 0 ];

// } );


var TEXTURES = {};
var textureLoader = new THREE.TextureLoader( loadingManager );
textureLoader.load( 'sprites/circle.png', function ( tex ) {

	TEXTURES.electric = tex;

} );

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
	bgColor: SETTINGS.bgColor,
	trailClearColor: SETTINGS.trailClearColor,
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

// Main --------------------------------------------------------
/* exported main, updateGuiInfo */

var gui, gui_info, gui_settings;

function main() {

	var neuralNet = window.neuralNet = new NeuralNetwork();

	initGui();

	run();

}

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
	// gui_settings.add( neuralNet.particlePool, 'pSize', 0.0, 10 ).name( 'Signal Size' );
	gui_settings.add( neuralNet.settings, 'amountEmittedSignals', 1, 200 ).name( 'Amount Emitted Signals' );
	gui_settings.add( neuralNet.settings, 'signalMinSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Min Speed' );
	gui_settings.add( neuralNet.settings, 'signalMaxSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Max Speed' );
	gui_settings.addColor( neuralNet.particlePool, 'pColor' ).name( 'Signal Color' );
	// gui_settings.add(  neuralNet.settings, 'trailSizeMult',0.0, 10.0, 0.01  ).name( 'Trail Size Mult' );
	gui_settings.add(  neuralNet.settings, 'trailHeadOpacity',0.0, 10.0, 0.01  ).name( 'opacity' );
	// gui_settings.add(  neuralNet.settings, 'trailTailOpacity',0.0, 1, 0.01  ).name( 'Trail Tail Opacity' );
	// gui_settings.add(  neuralNet.settings, 'trailLength',0, 100, 10  ).name( 'Trail Length' ).step(1);
	gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );
	gui_settings.add( neuralNet, 'releaseSignal' ).name( 'Release Signal' );
	gui_settings.open();
	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}

	gui_settings = gui.addFolder( 'Settings Connections ' );
	gui_settings.add( neuralNet.settings, 'maxAxonDist', 0, 100 ).name( 'Max Distance' );
	// gui_settings.add( neuralNet.settings, 'axonThickness', 0, 100 ).name( 'Axon Thickness' );
	gui_settings.add( neuralNet.settings, 'maxConnectionsPerNeuron', 0, 100 ).name( 'Max Connection Per Neuron' ).step(1);
	gui_settings.add( neuralNet, 'axonOpacityMultiplier', 0.0, 10.0 ).name( 'Axon Opacity Mult' );
	gui_settings.add( neuralNet, 'axonLineWeight', 0.0, 0.1).name( 'Axon LineWeight' ).step(0.001);
	gui_settings.addColor( neuralNet, 'axonColor' ).name( 'Axon Color' );
	gui_settings.open();

	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}
	gui_settings = gui.addFolder( 'Settings Neurons' );
	gui_settings.add( neuralNet.settings, 'xMax', 10, 300 ).onFinishChange(randomizeSeed);
	gui_settings.add( neuralNet.settings, 'yMax', 10, 300 ).onFinishChange(randomizeSeed);
	gui_settings.add( neuralNet.settings, 'zMax', 10, 300 ).onFinishChange(randomizeSeed);
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

function randomizeSeed() {
	let c = gui_settings.__controllers.filter(c => c.property == 'neuroSeed')[0];
	c.setValue(Math.floor(Math.random()*1000));
}

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
	// stats.update();
	FRAME_COUNT ++;

}

// Events --------------------------------------------------------

window.addEventListener( 'keypress', function ( event ) {

	var key = event.keyCode;

	switch ( key ) {

		case 32:/*space bar*/ sceneSettings.pause = !sceneSettings.pause;
			break;

		case 65:/*A*/
		case 97:/*a*/ sceneSettings.enableGridHelper = !sceneSettings.enableGridHelper;
			break;

		case 83 :/*S*/
		case 115:/*s*/ sceneSettings.enableAxisHelper = !sceneSettings.enableAxisHelper;
			break;

	}

} );


$( function () {
	var timerID;
	$( window ).resize( function () {
		clearTimeout( timerID );
		timerID = setTimeout( function () {
			onWindowResize();
		}, 250 );
	} );
} );


function onWindowResize() {

	// WIDTH = window.innerWidth;
	// HEIGHT = window.innerHeight;
	WIDTH = 1280;
	HEIGHT = 800;

	pixelRatio = 2;
	screenRatio = WIDTH / HEIGHT;

	camera.aspect = screenRatio;
	camera.updateProjectionMatrix();

	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );

}




function saveTiles(_renderer, _scene, _camera, _tiles) {
  var tileRenderer = _renderer;
  var tileScene = _scene;
  var tileCamera = _camera;
  var num_tiles = _tiles;
  var NUM_TILES = 2;

  num_tiles = num_tiles !== undefined ? num_tiles : NUM_TILES;

  if (!tileRenderer || !tileScene || !tileCamera) {
    console.warn('tilesaver: Please use init() to set up renderer, scene and camera');
    return;
  }

  if (num_tiles < 1) {
    console.warn('tilesaver: number of tiles needs to be > 0');
    return;
  }

  var timestamp = new Date().toISOString();
  var tileWidth = tileRenderer.domElement.width;
  var tileHeight = tileRenderer.domElement.height;
  var fullWidth = tileWidth * num_tiles;
  var fullHeight = tileHeight * num_tiles;
  console.log(tileWidth, tileHeight, fullWidth, fullHeight);

  var targetCanvas = document.createElement("canvas");
  targetCanvas.width = fullWidth;
  targetCanvas.height = fullHeight;
  var targetContext = targetCanvas.getContext("2d");

  for (var ty = 0; ty < num_tiles; ty++) {
    for (var tx = 0; tx < num_tiles; tx++) {
      var offsetX = tx * tileWidth;
      var offsetY = ty * tileHeight;
      tileCamera.setViewOffset(fullWidth, fullHeight, offsetX, offsetY, tileWidth, tileHeight);
      tileRenderer.render(tileScene, tileCamera);
      // save current tile
      targetContext.drawImage(tileRenderer.domElement, offsetX, offsetY);
    }
  }

  tileCamera.clearViewOffset();
  filename = targetCanvas, timestamp + '_' + fullWidth + 'x' + fullHeight + '.png';

    targetCanvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

  });
}
//# sourceMappingURL=tilesaver_es5.js.map
