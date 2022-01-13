/**
 * Pixelation shader
 */

const PixelShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: null },
		'intensity': { value: 1.0 },

	},

	vertexShader: /* glsl3 */`
		out vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

	fragmentShader: /* glsl3 */`
		in vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float intensity;
        vec3 bg(vec2 uv) {
           return texture(tDiffuse, uv).rgb;
        }
        vec3 effect(vec2 uv, vec3 col) {
           float granularity = intensity * 2.0;
           if(mod(granularity,2.0) > 0.0) {
               granularity += 1.0;
           };
           if(granularity > 0.0) {
               float dx = granularity / resolution.x;
               float dy = granularity / resolution.y;
               uv = vec2(dx*(floor(uv.x/dx) + 0.5),dy*(floor(uv.y/dy) + 0.5));
               return bg(uv);
           };
           return col;
        }
        void main() {
            vec3 tex = bg(vUv);
            vec3 col = effect(vUv,tex);
            gl_FragColor = vec4( col, 1.0 );
        }`
};

export { PixelShader };
