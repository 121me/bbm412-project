import {
	Color
} from './three.module.js';

/**
 * Sky shader
 */

const SkyShader = {

	uniforms: {
		"topColor": { value: new Color(0xeeffaa) },
		"bottomColor": { value: new Color(0x0044aa) },
		"exponent": { value: 0.5 }
	},

	vertexShader: /* glsl3 */`
    out vec3 vWorldPosition;
    
    void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `,

	fragmentShader: /* glsl3 */`
    uniform float offset;
    uniform float exponent;
    
    uniform vec3 topColor;
    uniform vec3 bottomColor;

    in vec3 vWorldPosition;

    void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.), exponent ), 0. ) ), 1. );
    }
    `
};

export { SkyShader };
