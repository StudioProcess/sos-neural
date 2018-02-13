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
