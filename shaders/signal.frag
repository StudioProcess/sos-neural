uniform vec3 color;
uniform float completion;
uniform float frontEdge;
uniform float fadeOut;

uniform float opacity;
varying float yVal;

void main() {

	// gl_FragColor = vec4(color, vOpacity);

  float alpha = smoothstep(frontEdge + 0.5, frontEdge, yVal);
  alpha *= mix(
    yVal * yVal * fadeOut,
    1.0,
    fadeOut
  );
  alpha *= opacity;

	gl_FragColor = vec4(color, alpha);

}
