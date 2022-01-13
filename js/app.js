// Main three.js library, it's magic !!!
import * as THREE from './three.module.js';

// Tween.js for animations
import { TWEEN } from "./tween.module.min.js";

// a library for FPS Stats and some other, IDK
import Stats from './stats.module.js';

// libraries for camera controls of course
import { OrbitControls } from './OrbitControls.js';
import { FirstPersonControls } from './FirstPersonControls.js';
import { TransformControls } from "./TransformControls.js";

// libraries to load the materials and meshes
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { TGALoader } from './TGALoader.js';
import { GLTFLoader } from "./GLTFLoader.js";

// libraries to pass shaders
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { ShaderPass } from './ShaderPass.js';
import { PixelShader } from './PixelShader.js';
import { SkyShader } from "./SkyShader.js";
import { GammaCorrectionShader } from "./GammaCorrectionShader.js";

import { GUI } from './lil-gui.module.min.js';

import * as SkeletonUtils from "./SkeletonUtils.js";

import { Matrix } from "./Matrix.js"

let gltfLoaded = 0;

let groundGroup;
let ground2D = [];

let firstMatrix;
let finalMatrix;
let finalSet;

let finalArray;

let pickaxeMan = undefined;
let pickaxeTime = 0;

let shovelMan = undefined;
let shovelTime = 0;

let nosToBeSelected = 10;
let nos = 30;

let defaultShaderTrailer, defaultShaderDrone;
let scene, renderer, stats, composerPixelShaderTrailer, composerPixelShaderDrone; // camera?
let cameraRig;
let cameraForTrailer, cameraForDrone;

let objectsTRS = [];

let environmentalObjects = new THREE.Group();

let pixelPass, gammaCorrectionPass;

const objProbs = cumulativeProbs([0.3,      0.20,   0.05,    0.05,    0.05,    0.9,      0.9,      0.9,       0.4,        0.06,
    0.06,       0.06,       0.06,     0.06,     0.06,       0.06,      0.2,     0.2]);
const objNames = ["Stone", "Pine1", "Log1", "Log2", "Log3", "Grass1", "Grass2", "Grass3", "DeadTree", "Flower1",
    "Flower2", "Flower3", "Flower4", "Flower5", "Flower6", "Flower7", "Tree1", "Tree2"];

function cumulativeProbs(probs) {
    let list = [];
    let sum = 0;
    for (let i = 0; i < probs.length; i++) {
        sum += probs[i];
        list.push(sum);
    }
    return list;
}

function nameFromProb(prob, probsList, namesList) {
    for (let i = 0; i < probsList.length; i++) {
        if (prob < probsList[i]) {
            return namesList[i];
        }
    }
    return probsList[probsList.length - 1]
}

// let stone;

const clock = new THREE.Clock();
//clock.stop();

const manager = new THREE.LoadingManager();
// manager.addHandler( /\.dds$/i, new DDSLoader() );
manager.addHandler( /\.tga$/i, new TGALoader() );

let mixers = [];

let controlsForDrone;
let controlsForTrailer;
let transformControlsDrone;
let transformControlsTrailer;

let spotLight;
let spotLightHelper;

let selectMode = false;

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

let amount = 30;
const sizeOfSoil = 3;
const offset = ( amount - 1 ) / 2;

let deltaTime = clock.getDelta();
let sky;

// const count = Math.pow( amount, 2 );

const randomDirtColor = [
    0xff0000,

    0xff3000,

    0xff6000,

    0xff9000,

    0xffc000,

    0xffff00,

    0xc0ff00,

    0x80ff00,

    0x40ff00,

    0x00ff00,
];


function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x88ccee );

    let skyGeometry = new THREE.SphereBufferGeometry( 300, 32, 15 );
    let skyMaterial = new THREE.ShaderMaterial( {
        uniforms: SkyShader.uniforms,
        vertexShader: SkyShader.vertexShader,
        fragmentShader: SkyShader.fragmentShader,
        side: THREE.BackSide,
    } );

    sky = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( sky );

    myObjLoader('Drone', [ 0, 1, 0 ], [ 1, 1, 1 ], [ 0, 0, 0] );
    myGltfLoader('ShovelMan', [ 10, 1, 10 ], [ 1, 1, 1 ], [ 0, 0, 0] );
    myGltfLoader('PickaxeMan', [ -10, 1, -10 ], [ 1, 1, 1 ], [ 0, 0, 0] );

    // cameraForTrailer
    cameraForTrailer = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 3000 );
    cameraForTrailer.position.set( amount * 0.5 * sizeOfSoil, amount * 0.5 * sizeOfSoil, amount * 0.5 * sizeOfSoil );
    cameraForTrailer.lookAt( 0, 0, 0 );
    // scene.add( cameraForTrailer );

    // cameraForDrone
    cameraForDrone = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 3000 );
    cameraForDrone.position.set( 0, 10, 0 );
    cameraForDrone.lookAt( 0, 0, 0 );
    // scene.add( cameraForDrone );

    /*
    cameraRig = new THREE.Group();

    cameraRig.add( cameraForTrailer );
    cameraRig.add( cameraForDrone );
    */

    scene.add( new THREE.AmbientLight( 0xffffff, 0.15 ) );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    dirLight.position.set( 0, 2, 0);
    dirLight.rotation.set( 0, 0, 0);
    scene.add( dirLight );

    const spotlightDummyGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const spotlightDummyMaterial = new THREE.MeshStandardMaterial( { color: 0x000000 } );
    const spotlightDummyMesh = new THREE.Mesh( spotlightDummyGeometry, spotlightDummyMaterial );

    spotlightDummyMesh.position.set( 0, 50, 0 );
    spotlightDummyMesh.rotation.set( 0, 0, 0 );

    scene.add( spotlightDummyMesh );

    spotLight = new THREE.SpotLight( 0xffffff, 0.9 );
    spotLight.angle = Math.PI / 4;
    spotLight.position.set( 0, -0.6, 0 );
    spotLight.target.position.set( 0, -1.6, 0 );

    spotLight.penumbra = 0.1;
    spotLight.distance = 2000;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.focus = 1;

    spotlightDummyMesh.add( spotLight );
    spotlightDummyMesh.add( spotLight.target );

    spotLightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( spotLightHelper );
    objectsTRS.push( spotlightDummyMesh );

    const axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

    const stoneDumbGeometry = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    const stoneDumbMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const stoneMesh = new THREE.Mesh( stoneDumbGeometry, stoneDumbMaterial );
    INTERSECTED = stoneMesh;
    scene.add( stoneMesh );

    createGround( amount );

    const algorithmButtons = {
        'createGround' : function () {
            createGround( amount );
        },

        'runAlgorithm' : function () {

            tween();

        },

        'amount' : amount,

        'number of sets (nos)' : 30,

        'nos to be selected' : 10,
    };

    const pixelShaderButtons = {
        'size' : 1.0,
    };

    const spotLightButtons = {
        'onOrOff': true,
    };

    let h;

    const gui = new GUI();

    // gui.add( buttons, 'run' ).name();

    h = gui.addFolder( 'Algorithm' );

    h.add( algorithmButtons, 'createGround' ).name('create new ground')
    h.add( algorithmButtons, 'runAlgorithm' ).name('run / rerun');
    h.add( algorithmButtons, 'amount', 10.0, 50.0, 2.0 ).name('map side length').onChange( function ( val ) {
        amount = val;
    } );
    h.add( algorithmButtons, 'number of sets (nos)', 2.0, 50.0, 1.0 ).name('number of sets (nos)').onChange( function (val) {
        nos = val;
    } );
    h.add( algorithmButtons, 'nos to be selected', 2.0, 50.0, 1.0 ).name('nos to be selected').onChange( function (val) {
        nosToBeSelected = val;
    } );

    h = gui.addFolder( 'Pixel Shader' );

    h.add( pixelShaderButtons, 'size', 0.0, 4.0, 0.05).onChange( function (val) {
        pixelPass.uniforms[ 'intensity' ].value = val;
    } );

    h = gui.addFolder( 'Spot Light' );

    h.add( spotLightButtons, 'onOrOff' ).name('switch').onChange( function (val) {
        spotLight.visible = val;
    } );

    // MAIN RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // CAMERA 1
    controlsForTrailer = new OrbitControls( cameraForTrailer, renderer.domElement );
    controlsForTrailer.target.set( 0, 1, 0 );
    controlsForTrailer.enablePan = false;

    // CAMERA 2
    controlsForDrone = new FirstPersonControls( cameraForDrone, renderer.domElement );
    controlsForDrone.lookAt( 30, 0, 30 );

    controlsForDrone.movementSpeed = 20;
    controlsForDrone.lookSpeed = 0.05;

    controlsForDrone.enabled = false;
    controlsForTrailer.enabled = true;

    controlsForTrailer.update();
    controlsForDrone.update( clock.getDelta() );

    // transform controls
    transformControlsDrone = new TransformControls( cameraForDrone, renderer.domElement );
    scene.add(transformControlsDrone);
    transformControlsTrailer = new TransformControls( cameraForTrailer, renderer.domElement );
    scene.add(transformControlsTrailer);

    stats = new Stats();
    document.body.appendChild( stats.dom );

    // DEFAULT SHADERS
    defaultShaderTrailer = new EffectComposer( renderer );
    defaultShaderDrone = new EffectComposer( renderer );

    // BLOCK OF CODES TO PASS PIXEL SHADER
    composerPixelShaderTrailer = new EffectComposer( renderer );
    composerPixelShaderDrone = new EffectComposer( renderer );

    // ADD PASSES TO SHADERS
    defaultShaderTrailer.addPass( new RenderPass( scene, cameraForTrailer ) );
    defaultShaderDrone.addPass( new RenderPass( scene, cameraForDrone ) );
    composerPixelShaderTrailer.addPass( new RenderPass( scene, cameraForTrailer ) );
    composerPixelShaderDrone.addPass( new RenderPass( scene, cameraForDrone ) );


    pixelPass = new ShaderPass( PixelShader );
    pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
    pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
    // TODO JUST PLAY WITH THIS VALUE TO CHANGE THE PIXEL SIZE
    pixelPass.uniforms[ 'intensity' ].value = 1.0;
    composerPixelShaderTrailer.addPass( pixelPass );
    composerPixelShaderDrone.addPass( pixelPass );


    const gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );
    defaultShaderTrailer.addPass( gammaCorrectionPass );
    defaultShaderDrone.addPass( gammaCorrectionPass );
    composerPixelShaderTrailer.addPass( gammaCorrectionPass );
    composerPixelShaderDrone.addPass( gammaCorrectionPass );

    scene.add( cameraForTrailer );
    scene.add( cameraForDrone );

    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);

}

function randomObjLoader() {
    for (let i = -amount * sizeOfSoil/2 + 1; i < amount * sizeOfSoil/2; i+= sizeOfSoil) {
        for (let j = -amount * sizeOfSoil / 2 + 1; j < amount * sizeOfSoil / 2; j+= sizeOfSoil) {
            if (Math.random() >= 0.8) {
                let randomScale = Math.random() / 4;
                let probability = Math.random() * objProbs[objProbs.length - 1];
                let name = nameFromProb(probability, objProbs, objNames);
                myObjLoader(name, [ i + 0.5, 0.0, j + 0.5 ], [ 1 + randomScale, 1 + randomScale, 1 + randomScale ], [ 0, Math.random() * 360, 0] );

            }
        }
    }
}


function createGround ( sideLength ) {

    scene.remove(groundGroup);
    scene.remove(environmentalObjects);

    randomObjLoader();

    let matrix = new Matrix( sideLength, nos, nosToBeSelected);
    let output = matrix.mainFunction();

    firstMatrix = output[0];
    finalMatrix = output[1];
    finalSet = output[2];

    groundGroup = new THREE.Group();
    environmentalObjects = new THREE.Group();

    const planeGeometry = new THREE.PlaneGeometry( sizeOfSoil, sizeOfSoil );
    const boxGeometry = new THREE.BoxGeometry( sizeOfSoil * sideLength, 3, sizeOfSoil * sideLength);

    const lowerGroundObject = new THREE.Mesh( boxGeometry, new THREE.MeshPhongMaterial( { color: 0x904000} ) );
    lowerGroundObject.position.y = -1.6;

    groundGroup.add( lowerGroundObject );

    ground2D = []

    let line;

    const offset = ( sideLength - 1 ) / 2;

    for ( let x = 0; x < sideLength; x ++ ) {

        line = [];

        for ( let z = 0; z < sideLength; z ++ ) {

            const object = new THREE.Mesh( planeGeometry,
                new THREE.MeshPhongMaterial( {
                    color: randomDirtColor[firstMatrix[x * sideLength + z]._health - 1]
                } ) );

            object.position.set( ( offset - x ) * sizeOfSoil, 0, ( offset - z ) * sizeOfSoil );
            object.rotation.x = Math.PI * 1.5;

            line.push( object );

            groundGroup.add( object );

        }

        ground2D.push(line);

    }

    scene.add( groundGroup );
    scene.add( environmentalObjects );
}

function onProgress (xhr) {

}

function onError (error) {

}

// FUNCTION TO LOAD A SINGLE .OBJ source
function myObjLoader(fileName, position, scale, rotation) {

    new MTLLoader( manager )
        .setPath( './resources/' )
        .load( fileName+'.mtl', function ( materials ) {

            materials.preload();

            new OBJLoader( manager )
                .setMaterials( materials )
                .setPath( './resources/' )
                .load( fileName+'.obj', function ( object ) {

                    object.position.set( ...position );
                    object.scale.set( ...scale );
                    object.rotation.set( ...rotation );

                    if (fileName === 'Drone') {
                        cameraForDrone.add(object);
                    } else {
                        environmentalObjects.add(object);
                        objectsTRS.push(object);
                    }

                }, onProgress, onError );
        } );
}

function myGltfLoader(fileName, position, scale, rotation) {

    const loader = new GLTFLoader();

    loader.load( './resources/'+fileName+'.glb', function ( gltf ) {

        const model = SkeletonUtils.clone( gltf.scene );

        const mixer = new THREE.AnimationMixer( model );

        mixer.clipAction( gltf.animations[ 0 ] ).play(); // working?

        model.position.set( ...position );
        model.scale.set( ...scale );
        model.rotation.set( ...rotation );

        mixers.push(mixer)

        gltfLoaded += 1;

        if (fileName === 'PickaxeMan') {
            pickaxeMan = model;
        } else if (fileName === 'ShovelMan') {
            shovelMan = model;
        }

        scene.add( model );

    }, onProgress, onError );

}

function onMouseDown ( event ) {

    if ( selectMode ) {

        let transformControls;
        let controls;

        if (cameraMode === 0) {
            transformControls = transformControlsTrailer;
            controls = controlsForTrailer;
        } else if (cameraMode === 1) {
            transformControls = transformControlsDrone;
            controls = controlsForDrone;
        }

        /*
        if (cameraMode === 0) {
            raycaster.setFromCamera(mouse, cameraForTrailer);
        } else if (cameraMode === 1) {
            raycaster.setFromCamera(mouse, cameraForDrone);
        }
        */

        const intersection = raycaster.intersectObjects(objectsTRS);

        if ( INTERSECTED && event.button === 0) {
            controls.enabled = !transformControls.dragging;
        }

    }

}

function onMouseUp ( event ) {

    if ( selectMode ) {

        let transformControls;
        let controls;

        if (cameraMode === 0) {
            transformControls = transformControlsTrailer;
            controls = controlsForTrailer;
        } else if (cameraMode === 1) {
            transformControls = transformControlsDrone;
            controls = controlsForDrone;
        }

        const intersection = raycaster.intersectObjects(objectsTRS);

        if (intersection.length === 0 && event.button === 0) {

            controls.enabled = true;

        }

    }

}

function onMouseMove ( event ) {

    if ( selectMode ) {

        let transformControls;

        if (cameraMode === 0) {
            transformControls = transformControlsTrailer;
        } else if (cameraMode === 1) {
            transformControls = transformControlsDrone;
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (cameraMode === 0) {
            raycaster.setFromCamera(mouse, cameraForTrailer);
        } else if (cameraMode === 1) {
            raycaster.setFromCamera(mouse, cameraForDrone);
        }

        const intersection = raycaster.intersectObjects(objectsTRS);

        if (intersection.length > 0 && !transformControls.dragging ) {

            if (INTERSECTED !== intersection[0].object) {

                if (INTERSECTED) {
                    transformControls.detach(INTERSECTED);
                }

                INTERSECTED = intersection[0].object;

                transformControls.attach(INTERSECTED);

            }

        }

    }

}

function onKeyDown( event ) {

    let transformControls;
    let controls;

    if ( cameraMode === 0 ) {
        transformControls = transformControlsTrailer;
        controls = controlsForTrailer;
    } else if ( cameraMode === 1 ) {
        transformControls = transformControlsDrone;
        controls = controlsForDrone;
    }

    switch ( event.keyCode ) {

        case 49: // 1 Trailer Camera
            if ( !selectMode ) {
                //clock.stop();
                controlsForDrone.enabled = false;
                controlsForTrailer.enabled = true;
                cameraMode = 0;
            }
            break;

        case 50: // 2 Drone Camera
            if ( !selectMode ) {
                clock.start();
                controlsForTrailer.enabled = false;
                controlsForDrone.enabled = true;
                cameraMode = 1;
            }
            break;

        case 72: // H s(h)ader
            renderMode = (renderMode + 1) % 2;
            break;

        case 75: // K s(k)y
            sky.visible = !sky.visible;
            break;

        case 76: // L Se(l)ect

            if ( selectMode ) {
                transformControls.detach(INTERSECTED);
                INTERSECTED = undefined;
            }

            selectMode = !selectMode;
            break;

        case 79: // O R(o)tate

            if (selectMode) {
                transformControls.setMode("rotate");
            }
            break;

        case 84: // T (T)ranslate

            if (selectMode) {
                transformControls.setMode("translate");
            }
            break;

        case 69: // E Scal(e)

            if (selectMode) {
                transformControls.setMode("scale");
            }
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
        controlsForDrone.update( deltaTime );

    }

    TWEEN.update();

    stats.update();

    spotLightHelper.update();

}

function tween() {

    for ( let cell of finalSet ) {
        new TWEEN.Tween(ground2D[cell.y][cell.x].material.color).to(
            {
                r: 0,
                g: 1,
                b: 0,
            }, Math.random() * 3000 + 1000 )
            .easing( TWEEN.Easing.Quadratic.Out ).start();
    }

}

function animate() {

    if ( gltfLoaded === 2 ) {

        for ( const mixer of mixers ) mixer.update( deltaTime );

    }

}

function render() {

    requestAnimationFrame( render );

    deltaTime = clock.getDelta();

    if ( gltfLoaded === 2 ) {

        update();

        animate();

        if (renderMode === 0) {

            if (cameraMode === 0) {

                defaultShaderTrailer.render(scene, cameraForTrailer);

            } else if (cameraMode === 1) {

                defaultShaderDrone.render(scene, cameraForDrone);

            }

        } else if (renderMode === 1) {

            if (cameraMode === 0) {

                composerPixelShaderTrailer.render(deltaTime);

            } else if (cameraMode === 1) {

                composerPixelShaderDrone.render(deltaTime);

            }

        }

    }

}

init();

render();
