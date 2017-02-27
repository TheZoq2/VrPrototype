
// Last time the scene was rendered.
var lastRenderTime = 0;
// Currently active VRDisplay.
var vrDisplay;
// How big of a box to render.
var boxSize = 25;
// Various global THREE.Objects.
var scene;
var cube;
var controls;
var effect;
var camera;
// EnterVRButton for rendering enter/exit UI.
var vrButton;

var roomX = 5;
var roomZ = 4;

var walls = [];
var materials = [];

var roomHeight = 4;
var floor;
var floorMaterial;

var testCube;
var couch;

var cursor;

var LOOK_AROUND = 0;
var PLACE_LAMP = 1;
var PLACE_COUCH = 2;

var state = LOOK_AROUND

function onLoad() {
    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
    // Only enable it if you actually need to.
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);

    // Append the canvas element created by the renderer to document body element.
    document.body.appendChild(renderer.domElement);

    // Create a three.js scene.
    scene = new THREE.Scene();

    // Create a three.js camera.
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

    controls = new THREE.VRControls(camera);
    controls.standing = true;
    camera.position.y = controls.userHeight;
    camera.position.x = 3;
    camera.position.z = 3;

    // Apply VR stereo rendering to renderer.
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    // Add a repeating grid as a skybox.
    var loader = new THREE.TextureLoader();
    loader.load('img/box.png', onTextureLoaded);


    //var light = new THREE.PointLight()
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var light = new THREE.PointLight(0xffffff, 1, 10);
    light.position.set(1, roomHeight, 1)
    scene.add(light);

    // Create 3D objects.
    //var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //var material = new THREE.MeshNormalMaterial();
    //cube = new THREE.Mesh(geometry, material);

    //// Position cube mesh to be right in front of you.
    //cube.position.set(0, controls.userHeight, -1);

    // Add cube mesh to your three.js scene
    //scene.add(cube);
    var testGeometry = new THREE.BoxGeometry(1, 1, 1);
    testObject = new THREE.Mesh(testGeometry, new THREE.MeshPhongMaterial());
    scene.add(testObject);
    var cursorGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    cursor = new THREE.Mesh(cursorGeometry, new THREE.MeshPhongMaterial());
    scene.add(cursor);

    materials.push(new THREE.MeshPhongMaterial());
    materials.push(new THREE.MeshPhongMaterial());
    materials.push(new THREE.MeshPhongMaterial());
    materials.push(new THREE.MeshPhongMaterial());

    var xGeometry = new THREE.BoxGeometry(0.1, 10, 10);
    var zGeometry = new THREE.BoxGeometry(10, 10, 0.1);
    var wall1 = new THREE.Mesh(xGeometry, materials[0]);
    var wall2 = new THREE.Mesh(xGeometry, materials[1]);
    var wall3 = new THREE.Mesh(zGeometry, materials[2]);
    var wall4 = new THREE.Mesh(zGeometry, materials[3]);
    wall1.position.x = roomX;
    wall2.position.x = -roomX;
    wall3.position.z = roomZ;

    //Adding the 4th wall
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) { };
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath( 'models/' );
    objLoader.load( 'wallWindows.obj', function ( object ) {
        object.position.z = -roomZ;
        scene.add( object );
        walls.push(object);
    }, onProgress, onError );

    scene.add(wall1);
    scene.add(wall2);
    scene.add(wall3);
    scene.add(wall4);

    walls.push(wall1);
    walls.push(wall2);
    walls.push(wall3);


    //Adding some furniture
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) { };
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath( 'models/chenilleCouch/' );
    objLoader.load( 'chenilleCouch.obj', function ( object ) {
        object.position.x = -4;
        object.scale.x = 1.5;
        object.scale.y = 1.5;
        object.scale.z = 1.5;
        scene.add( object );
        couch = object
    }, onProgress, onError );

    var floorTexture = new THREE.TextureLoader().load( "img/floor.jpg" );
    var floorGeometry = new THREE.BoxGeometry(10, 0.1, 10);
    floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    window.addEventListener('resize', onResize, true);
    window.addEventListener('vrdisplaypresentchange', onResize, true);

    // Initialize the WebVR UI.
    var uiOptions = {
        color: 'black',
        background: 'white',
        corners: 'square'
    };
    vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);
    vrButton.on('exit', function() {
        camera.quaternion.set(0, 0, 0, 1);
        //camera.position.set(0, controls.userHeight, 0);
    });
    vrButton.on('hide', function() {
        document.getElementById('ui').style.display = 'none';
    });
    vrButton.on('show', function() {
        document.getElementById('ui').style.display = 'inherit';
    });
    document.getElementById('vr-button').appendChild(vrButton.domElement);
    document.getElementById('magic-window').addEventListener('click', function() {
        vrButton.requestEnterFullscreen();
    });


    document.body.addEventListener('click', onClick);
}

function onTextureLoaded(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(boxSize, boxSize);

    var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0x01BE00,
        side: THREE.BackSide
    });

    // Align the skybox to the floor (which is at y=0).
    skybox = new THREE.Mesh(geometry, material);
    skybox.position.y = boxSize/2;
    scene.add(skybox);

    // For high end VR devices like Vive and Oculus, take into account the stage
    // parameters provided.
    setupStage();
}


function floorPositionFromCamera()
{
    //var floor = new THREE.Plane(new THREE.Vector3(1, 0, 0));
    //intersect = floor.intersectLine(new THREE.Line3(camera.getWorldDirection()));
    
    raycaster = new THREE.Raycaster(camera.position, camera.getWorldDirection());
    //raycaster.setFromCamera(new THREE.Vector2(0.5, 0.5))

    var intersects = raycaster.intersectObject(floor)
    
    if(intersects.length != 0)
    {
        point = intersects[0].point;
        //testObject.position.set(point.x, point.y, point.z);
        return point;
    }
    return null
}

function lookingAt(object)
{
    raycaster = new THREE.Raycaster(camera.position, camera.getWorldDirection());
    //raycaster.setFromCamera(new THREE.Vector2(0.5, 0.5))

    var intersects = raycaster.intersectObject(object);
    if(intersects.length != 0)
    {
        return true
    }
    return false;
}

// Request animation frame loop function
function animate(timestamp) {
    var delta = Math.min(timestamp - lastRenderTime, 500);
    lastRenderTime = timestamp;

    // Apply rotation to cube mesh
    //cube.rotation.y += delta * 0.0006;

    // Only update controls if we're presenting.
    if (vrButton.isPresenting()) {
        controls.update();
    }
    // Render the scene.
    effect.render(scene, camera);

    var floorPosition = floorPositionFromCamera();

    if(state == PLACE_LAMP)
    {
        if(floorPosition != null)
        {
            testObject.position.set(point.x, point.y, point.z);
        }
    }
    if(state == PLACE_COUCH)
    {
        if(floorPosition != null)
        {
            couch.position.set(point.x, point.y, point.z);
        }
    }



    //Cursor
    raycaster = new THREE.Raycaster(camera.position, camera.getWorldDirection());
    var intersects = raycaster.intersectObjects(scene.children);
    if(intersects.length != 0)
    {
        point = intersects[0].point;
        cursor.position.set(point.x, point.y, point.z);
    }

    vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function onClick() {
    floorPosition = floorPositionFromCamera();
    console.log(floorPosition);

    console.log(state);

    if(state == LOOK_AROUND)
    {
        if(lookingAt(testObject)) {state = PLACE_LAMP};
        if(lookingAt(couch)) {state = PLACE_COUCH; Console.log("couch")};
    }
    else if(state == PLACE_LAMP)
    {
        if(floorPosition != null)
        {
            testObject.position.set(point.x, point.y, point.z);
            state = LOOK_AROUND
        }
    }
    else if(state == PLACE_COUCH)
    {
        if(floorPosition != null)
        {
            couch.position.set(point.x, point.y, point.z);
            state = LOOK_AROUND
        }
    }
}

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
function setupStage() {
    navigator.getVRDisplays().then(function(displays) {
        if (displays.length > 0) {
            vrDisplay = displays[0];
            if (vrDisplay.stageParameters) {
                setStageDimensions(vrDisplay.stageParameters);
            }
            vrDisplay.requestAnimationFrame(animate);
        }
    });
}

function setStageDimensions(stage) {
    // Make the skybox fit the stage.
    var material = skybox.material;
    scene.remove(skybox);

    // Size the skybox according to the size of the actual stage.
    var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
    skybox = new THREE.Mesh(geometry, material);

    // Place it on the floor.
    skybox.position.y = boxSize/2;
    scene.add(skybox);

    // Place the cube in the middle of the scene, at user height.
    cube.position.set(0, controls.userHeight, 0);
}

window.addEventListener('load', onLoad);

