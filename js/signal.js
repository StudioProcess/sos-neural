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
