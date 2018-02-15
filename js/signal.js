// Signal extends THREE.Vector3 ----------------------------------------------------------------

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
	var trailMaterial = THREE.TrailRenderer.createBaseMaterial();	
	var color = new THREE.Color(particlePool.pColor);
	var alphaHead  = neuralNet.settings.trailHeadOpacity;
	var alphaTail  = neuralNet.settings.trailTailOpacity;
	trailMaterial.uniforms.headColor.value.set(color.r,color.g,color.b, alphaHead);
	trailMaterial.uniforms.tailColor.value.set( color.r,color.g,color.b, alphaTail);
	// specify length of trail
	var trailLength = neuralNet.settings.trailLength;

	var trailHeadGeometry = [];
	
	for ( var i = 0; i < circlePoints.length; i++)  {
		trailHeadGeometry.push( circlePoints[i].clone().multiplyScalar( neuralNet.settings.trailSizeMult));
	}


	// trailHeadGeometry.push( 
	//   new THREE.Vector3( -0.1* neuralNet.settings.trailSizeMult, 0.0, 0.0 ), 
	//   new THREE.Vector3( 0.0* neuralNet.settings.trailSizeMul, 0.0, 0.0 ), 
	//   new THREE.Vector3( 0.1* neuralNet.settings.trailSizeMul, 0.0, 0.0 ) 
	// );	
	// initialize the trail
	var geom = new THREE.Geometry();
	geom.vertices.push(this.particle);
	this.mesh = new THREE.Mesh(geom);
	this.trailRenderer.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, this.mesh );
	this.trailRenderer.activate();

	this.aboutToDie = false;
}

Signal.prototype = Object.create( THREE.Vector3.prototype );

Signal.prototype.setConnection = function ( Connection ) {

	this.startingPoint = Connection.startingPoint;
	this.axon = Connection.axon;
	if ( this.startingPoint === 'A' ) this.t = 0;
	else if ( this.startingPoint === 'B' ) this.t = 1;

};

Signal.prototype.travel = function ( deltaTime ) {



	if( this.aboutToDie){
		this.trailRenderer.advance()
		this.trailRenderer.updateHead()
		return;
	}

	var pos;
	if ( this.startingPoint === 'A' ) {
		this.t += this.speed * deltaTime;
		if ( this.t >= 1  ) {
			this.t = 1;
			this.aboutToDie = true;
			this.axon.neuronB.receivedSignal = true;
			this.axon.neuronB.prevReleaseAxon = this.axon;
			var that = this;
			setTimeout(function() {
			        that.trailRenderer.deactivate();
			        that.alive = false;

			    }, 1000);
		}

	} else if ( this.startingPoint === 'B' ) {
		this.t -= this.speed * deltaTime;
		if ( this.t <= 0 ) {
			this.t = 0;
			this.aboutToDie = true;
			this.axon.neuronA.receivedSignal = true;
			this.axon.neuronA.prevReleaseAxon = this.axon;
			var that = this;
			setTimeout(function() {
			        that.trailRenderer.deactivate();
			        that.alive = false;

			    }, 1000);
		}
	}


	
	pos = this.axon.getPoint( this.t );
	// pos = this.axon.getPointAt(this.t);	// uniform point distribution but slower calculation

	this.particle.set( pos.x, pos.y, pos.z );
	this.mesh.position.set(pos.x, pos.y, pos.z);
	this.mesh.updateMatrixWorld();
	this.trailRenderer.advance()
	this.trailRenderer.updateHead()

};
