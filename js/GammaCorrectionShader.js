/**
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

const GammaCorrectionShader = {

	uniforms: {

		'tDiffuse': { value: null }

	},

	vertexShader: /* glsl3 */`
		out vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl3 */`
		uniform sampler2D tDiffuse;

		in vec2 vUv;

		void main() {

			vec4 tex = texture( tDiffuse, vUv );

			gl_FragColor = LinearTosRGB( tex );

		}`

};

export { GammaCorrectionShader };
