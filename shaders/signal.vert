uniform float opacityMultiplier;
uniform float axonLineWeight;

uniform vec3 positionStart;
uniform vec3 positionEnd;

uniform float lineWeight;

attribute vec3 extrude;


// attribute float opacity;

// varying float vOpacity;

varying float yVal;

void main() {

	// vOpacity = opacity * opacityMultiplier;

	vec4 transformedStart = modelViewMatrix * vec4(positionStart, 1.0);
  vec4 transformedEnd = modelViewMatrix * vec4(positionEnd, 1.0);

	vec4 transformed = vec4(1.0);
  transformed.xyz = mix(
    transformedStart.xyz,
    transformedEnd.xyz,
    position.z
  );

	vec2 lineV = normalize(transformedStart.xy - transformedEnd.xy);
  vec2 extrudeV;
  extrudeV.x = lineV.y;
  extrudeV.y = -lineV.x;

  extrudeV *= mix(
    transformedStart.w,
    transformedEnd.w,
    position.z
  );

	transformed.xy += (position.x * lineWeight) * extrudeV;

  yVal = position.z;

	gl_Position = projectionMatrix * transformed;

}
