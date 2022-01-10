// Main three.js library, it's magic !!!
import * as THREE from './three.module.js';

// Tween.js for animations
import { TWEEN } from "./tween.module.min.js";

// a library for FPS Stats and some other, IDK
import Stats from './stats.module.js';

// libraries for camera controls of course
import { OrbitControls } from './OrbitControls.js';
import { FirstPersonControls } from './FirstPersonControls.js';

// libraries to load the materials and meshes
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { TGALoader } from './TGALoader.js';

// libraries to pass shaders
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { ShaderPass } from './ShaderPass.js';
import { PixelShader } from './PixelShader.js';
import { GammaCorrectionShader } from "./GammaCorrectionShader.js";

import { GUI } from './lil-gui.module.min.js';

let scene, renderer, stats, composerPixelShaderTrailer, composerPixelShaderDrone; // camera?
let cameraRig;
let cameraForTrailer, cameraForDrone;

let objectsTRS = [];

let pixelPass, gammaCorrectionPass;

// let stone;

const clock = new THREE.Clock();

const manager = new THREE.LoadingManager();
// manager.addHandler( /\.dds$/i, new DDSLoader() );
manager.addHandler( /\.tga$/i, new TGALoader() );

let controlsForDrone;
let controlsForTrailer;

/* 0 default render
 * 1 pixel render
 */
let renderMode = 0;

/* 0 trailer camera
 * 1 drone camera
 */
let cameraMode = 0;

let INTERSECTED = undefined;
const mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

const amount = 30;
const sizeOfSoil = 3;
const offset = ( amount - 1 ) / 2;

// const count = Math.pow( amount, 2 );

const randomDirtColor = [
    0xff0000,

    0xff5000,

    0xffa000,

    0xffff00,
    0xffff00,
    0xffff00,

    0xa0ff00,
    0xa0ff00,
    0xa0ff00,

    0x50ff00,
    0x50ff00,
    0x50ff00,

    0x00ff00,
    0x00ff00,
    0x00ff00,
    0x00ff00,
    0x00ff00
];

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x88ccee );

    // cameraForTrailer
    cameraForTrailer = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 200 );
    cameraForTrailer.position.set( amount * 0.5 * sizeOfSoil, amount * 0.5 * sizeOfSoil, amount * 0.5 * sizeOfSoil );
    cameraForTrailer.lookAt( 0, 0, 0 );
    // scene.add( cameraForTrailer );

    // cameraForDrone
    cameraForDrone = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 200 );
    cameraForDrone.position.set( 0, amount * 0.5 * sizeOfSoil, 0 );
    cameraForDrone.lookAt( 0, 0, 0 );
    // scene.add( cameraForDrone );

    /*
    cameraRig = new THREE.Group();

    cameraRig.add( cameraForTrailer );
    cameraRig.add( cameraForDrone );
    */

    scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );

    const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
    spotLight.angle = Math.PI / 4;
    spotLight.position.set( 0, 10, 0 );
    spotLight.rotation.set( 1, 0, 0 );

    scene.add( spotLight );
    const spotLightHelper = new THREE.SpotLightHelper( spotLight );

    scene.add( spotLightHelper );

    const axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

    const stoneDumbGeometry = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    const stoneDumbMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const stoneMesh = new THREE.Mesh( stoneDumbGeometry, stoneDumbMaterial );
    INTERSECTED = stoneMesh;
    scene.add( stoneMesh );

    const planeGeometry = new THREE.PlaneGeometry( sizeOfSoil, sizeOfSoil );
    const boxGeometry = new THREE.BoxGeometry( sizeOfSoil * amount, 1, sizeOfSoil * amount);

    const lowerGroundObject = new THREE.Mesh( boxGeometry, new THREE.MeshPhongMaterial( { color: 0x904000} ) );
    lowerGroundObject.position.y = -0.6;
    scene.add( lowerGroundObject );

    for ( let x = 0; x < amount; x ++ ) {

        for ( let z = 0; z < amount; z ++ ) {

            const object = new THREE.Mesh( planeGeometry,
                new THREE.MeshPhongMaterial( {
                    color: randomDirtColor[ Math.floor( Math.random() * randomDirtColor.length ) ]
                } ) );

            object.position.set( ( offset - x ) * sizeOfSoil, 0, ( offset - z ) * sizeOfSoil );
            object.rotation.x = Math.PI * 1.5;

            scene.add( object );

        }

    }

    const gui = new GUI();

    // MAIN RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    console.log(renderer.renderLists);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );

    // CAMERA 1
    controlsForTrailer = new OrbitControls( cameraForTrailer, renderer.domElement );
    controlsForTrailer.target.set( 0, 1, 0 );
    controlsForTrailer.enablePan = false;
    controlsForTrailer.update();

    // CAMERA 2
    controlsForDrone = new FirstPersonControls( cameraForDrone, renderer.domElement );
    controlsForDrone.lookAt( 0, 0, 0 );

    controlsForDrone.movementSpeed = 20;
    controlsForDrone.lookSpeed = 0.05;
    controlsForDrone.lookVertical = true;

    controlsForDrone.enabled = false;
    controlsForTrailer.enabled = true;

    // FUNCTION TO LOAD A SINGLE STONE
    myObjLoader('stone', [ 0, 2, -6 ], [ 2, 2, 2 ] );
    myObjLoader('stone', [ 0, 2, -3 ], [ 2, 2, 2 ] );
    myObjLoader('stone', [ 0, 2, 0 ], [ 2, 2, 2 ] );
    myObjLoader('stone', [ 0, 2, 9 ], [ 2, 2, 2 ] );
    myObjLoader('stone', [ 3, 2, 3 ], [ 2, 2, 2 ] );
    myObjLoader('stone', [ 9, 2, 9 ], [ 2, 2, 2 ] );

    stats = new Stats();
    document.body.appendChild( stats.dom );

    // BLOCK OF CODES TO PASS PIXEL SHADER
    composerPixelShaderTrailer = new EffectComposer( renderer );
    composerPixelShaderDrone = new EffectComposer( renderer );

    composerPixelShaderTrailer.addPass( new RenderPass( scene, cameraForTrailer ) );
    composerPixelShaderDrone.addPass( new RenderPass( scene, cameraForDrone ) );

    pixelPass = new ShaderPass( PixelShader );
    pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
    pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );

    // TODO JUST PLAY WITH THIS VALUE TO CHANGE THE PIXEL SIZE
    pixelPass.uniforms[ 'pixelSize' ].value = 4;
    composerPixelShaderTrailer.addPass( pixelPass );
    composerPixelShaderDrone.addPass( pixelPass );

    const gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );
    composerPixelShaderTrailer.addPass( gammaCorrectionPass );
    composerPixelShaderDrone.addPass( gammaCorrectionPass );

    scene.add( cameraForTrailer );
    scene.add( cameraForDrone );

    console.log(1);

    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener('mousemove', onMouseMove);

}

const onProgress = function () {};

const onError = function () {};

// FUNCTION TO LOAD A SINGLE .OBJ source
function myObjLoader(fileName, position, scale) {

    new MTLLoader( manager )
        .setPath( './resources/' )
        .load( fileName+'.mtl', function ( materials ) {

            materials.preload();

            new OBJLoader( manager )
                .setMaterials( materials )
                .setPath( './resources/' )
                .load( fileName+'.obj', function ( object ) {

                    object.scale.set( ...scale );
                    object.position.set( ...position );
                    objectsTRS.push(object);
                    scene.add( object );

                }, onProgress, onError );
        } );
}

function onMouseMove ( event ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if ( cameraMode === 0 ) {
        raycaster.setFromCamera( mouse, cameraForTrailer );
    } else if ( cameraMode === 1 ) {
        raycaster.setFromCamera( mouse, cameraForDrone );
    }

    const intersection = raycaster.intersectObjects( objectsTRS );

    if ( intersection.length > 0 ) {

        if ( INTERSECTED !== intersection[0].object ) {

            INTERSECTED = intersection[0].object;

            console.log( INTERSECTED );

            tween( INTERSECTED );

        }


    }

}

function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 49: // 1 Trailer Camera
            controlsForDrone.enabled = false;
            controlsForDrone.lookSpeed = 0.0;
            controlsForTrailer.enabled = true;
            cameraMode = 0;
            break;

        case 50: // 2 Drone Camera
            controlsForTrailer.enabled = false;
            controlsForDrone.lookSpeed = 0.05;
            controlsForDrone.enabled = true;
            cameraMode = 1;
            break;

        case 77: // M shader
            renderMode = (renderMode + 1) % 2;
            break;

    }

}

function onWindowResize() {

    cameraForTrailer.aspect = window.innerWidth / window.innerHeight;
    cameraForTrailer.updateProjectionMatrix();

    cameraForDrone.aspect = window.innerWidth / window.innerHeight;
    cameraForDrone.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    pixelPass.uniforms[ 'resolution' ].value.set( window.innerWidth, window.innerHeight ).multiplyScalar( window.devicePixelRatio );

}

//

function update() {

    if (cameraMode === 0) {

        cameraForTrailer.updateProjectionMatrix();
        controlsForTrailer.update();

    } else if (cameraMode === 1) {

        cameraForDrone.updateProjectionMatrix();
        controlsForDrone.update( clock.getDelta() );

    }

    TWEEN.update();

    stats.update();

}

function tween( stone ) {
    new TWEEN.Tween( stone.position ).to( {
        x: ( offset - Math.random() * amount ),
        y: 2,
        z: ( offset - Math.random() * amount )
    }, Math.random() * 1000 + 1000 )
        .easing( TWEEN.Easing.Quadratic.Out ).start();
}

function animate() {

    setTimeout( animate, 2000 );

}

function render() {

    update();

    if ( renderMode === 0 ) {

        if ( cameraMode === 0 ) {

            renderer.render(scene, cameraForTrailer);

        } else if ( cameraMode === 1 ) {

            renderer.render(scene, cameraForDrone);

        }

    } else if ( renderMode === 1 ) {

        if ( cameraMode === 0 ) {

            composerPixelShaderTrailer.render( clock.getDelta() );

        } else if ( cameraMode === 1 ) {

            composerPixelShaderDrone.render( clock.getDelta() );

        }

    }

    requestAnimationFrame( render );

}

init();
animate();
render();
