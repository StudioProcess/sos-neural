uniform float opacityMultiplier;
uniform float axonLineWeight;

attribute vec3 extrude;

attribute vec3 positionStart;
attribute vec3 positionEnd;

attribute float opacity;

varying float vOpacity;

void main() {

	vOpacity = opacity * opacityMultiplier;

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

	transformed.xy += (position.x * axonLineWeight) * extrudeV;

	gl_Position = projectionMatrix * transformed;

}
