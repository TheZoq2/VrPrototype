
// Last time the scene was rendered.
var lastRenderTime = 0;
// Currently active VRDisplay.
var vrDisplay;
// How big of a box to render.
var boxSize = 100;
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
var EDIT_WALL_COLOR = 3;

var state = LOOK_AROUND
var targetWall = 0;
var wallAngleOffset = -90;

//Sphere textures
var paintbucketCylinder;
var paintbucketMaterial;

var lookAroundCylinder;
var lookAroundCylinderMaterial;

var lampLight;
var lampHeight = 2.5;

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
    camera.rotation.order = 'YXZ';

    controls = new THREE.VRControls(camera);
    controls.standing = true;
    camera.position.y = controls.userHeight;
    camera.position.x = 0;
    camera.position.z = 0;
    camera.rotation.y = 0.5;

    // Apply VR stereo rendering to renderer.
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    // Add a repeating grid as a skybox.
    var loader = new THREE.TextureLoader();
    loader.load('img/city.jpg', onTextureLoaded);


    //var light = new THREE.PointLight()
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var light = new THREE.PointLight(0xffffff, 1, 10);
    light.position.set(1, roomHeight, 1)
    scene.add(light);


    // Create 3D objects.
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) { };
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath( 'models/' );
    objLoader.load( 'lamp.obj', function ( object ) {
        scene.add( object );
        object.position.x = 3;
        object.position.z = 3;
        object.scale.set(0.6, 0.3, 0.6);
        testObject = object;
        lampLight = new THREE.PointLight(0xfff8ab, 0.7, 4);
        lampLight.position.set(3, lampHeight, 3)
        scene.add(lampLight);
    }, onProgress, onError );

    //// Position cube mesh to be right in front of you.
    //cube.position.set(0, controls.userHeight, -1);

    // Add cube mesh to your three.js scene
    //scene.add(cube);
    var testGeometry = new THREE.BoxGeometry(1, 1, 1);
    testObject = new THREE.Mesh(testGeometry, new THREE.MeshPhongMaterial());
    scene.add(testObject);
    //var cursorGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //cursor = new THREE.Mesh(cursorGeometry, new THREE.MeshPhongMaterial());
    //scene.add(cursor);

    materials.push(new THREE.MeshPhongMaterial());
    materials.push(new THREE.MeshPhongMaterial());
    materials.push(new THREE.MeshPhongMaterial());

    var xGeometry = new THREE.BoxGeometry(0.1, 10, 10);
    var zGeometry = new THREE.BoxGeometry(10, 10, 0.1);
    var wall1 = new THREE.Mesh(xGeometry, materials[0]);
    var wall2 = new THREE.Mesh(xGeometry, materials[1]);
    var wall3 = new THREE.Mesh(zGeometry, materials[2]);
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
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                materials.push(child.material);
            }
        } );


        object.position.z = -roomZ;
        scene.add( object );
        walls.push(object);
    }, onProgress, onError );

    scene.add(wall1);
    scene.add(wall2);
    scene.add(wall3);
    //scene.add(wall4);

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

    var ceilingGeometry = new THREE.BoxGeometry(10, 0.1, 10);
    ceilingMaterial = new THREE.MeshPhongMaterial();
    ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 5;
    scene.add(ceiling);


    var circumference = 20;
    var radius = circumference / 3.14 / 2;
    var height = 5;

    var paintbucketTexture = new THREE.TextureLoader().load( "img/paintbuckets.png" );
    var lookAroundTexture = new THREE.TextureLoader().load( "img/lookAroundUi.png" );
    var cylinderGeometry = new THREE.CylinderGeometry( radius, radius, height, 60, 1, true );
    cylinderGeometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    cylinderGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, controls.userHeight, 0));

    //floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
    paintbucketMaterial = new THREE.MeshBasicMaterial({
            map: paintbucketTexture,
            transparent: true,
    })
    paintbucketCylinder = new THREE.Mesh(cylinderGeometry, paintbucketMaterial);
    scene.add(paintbucketCylinder);

    lookAroundCylinderMaterial = new THREE.MeshBasicMaterial({
            map: lookAroundTexture,
            transparent: true,
    })
    lookAroundCylinder = new THREE.Mesh(cylinderGeometry, lookAroundCylinderMaterial);
    lookAroundCylinder.position.y = -1000;
    scene.add(lookAroundCylinder);

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
        camera.rotation.y = 0.5;
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
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set(boxSize, boxSize);

    var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
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

    var intersects = raycaster.intersectObject(object, true);
    if(intersects.length != 0)
    {
        return true
    }
    return false;
}

function isNearColorSelector()
{
    var cameraAngle = camera.rotation.y;
    var cameraDegrees = cameraAngle / (3.14 * 2) * 360;

    var camera_degrees_x = camera.rotation.x / (3.14 * 2) * 360;

    var threshold = 10;
    if(
        (
            cameraDegrees < -180 + threshold ||
            (cameraDegrees > -90 - threshold && cameraDegrees < -90 + threshold) ||
            (cameraDegrees > -threshold && cameraDegrees < threshold) ||
            (cameraDegrees > 90 - threshold && cameraDegrees < 90 + threshold) ||
            cameraDegrees > 180 - threshold
        )
        && Math.abs(camera_degrees_x) < threshold
    )
    {
        return true
    }
    else
    {
        return false
    }
}

// Request animation frame loop function
function animate(timestamp) {
    var delta = Math.min(timestamp - lastRenderTime, 500);
    lastRenderTime = timestamp;

    var cameraAngle = camera.rotation.y;
    var cameraDegrees = cameraAngle / (3.14 * 2) * 360;
    var camera_degrees_x = camera.rotation.x / (3.14 * 2) * 360;

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
            lampLight.position.set(point.x, point.y + lampHeight, point.z);
        }
    }
    if(state == PLACE_COUCH)
    {
        if(floorPosition != null)
        {
            couch.position.set(point.x, point.y, point.z);
        }
    }
    if(state == EDIT_WALL_COLOR)
    {
        var hue = (cameraDegrees-wallAngleOffset) / 90 + 0.5;
        var saturation = ((camera_degrees_x + 20) / 45);
        console.log(saturation);
        materials[targetWall].color.setHSL(hue, saturation, 0.5);
    }


    if(isNearColorSelector())
    {
        paintbucketCylinder.position.y = 0;
    }
    else
    {
        paintbucketCylinder.position.y = -1000;
    }


    vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function onClick(e) {
    floorPosition = floorPositionFromCamera();

    var cameraAngle = camera.rotation.y;
    var cameraDegrees = cameraAngle / (3.14 * 2) * 360;
    var camera_degrees_x = camera.rotation.x / (3.14 * 2) * 360;
    console.log(cameraDegrees)

    if(e.button == 2)
    {
        e.preventDefault();
    }
    else
    {
        if(state == LOOK_AROUND)
        {
            if(lookingAt(testObject)) {
                state = PLACE_LAMP;
            };
            if(lookingAt(couch)) {state = PLACE_COUCH};
            if(isNearColorSelector()) 
            {
                state = EDIT_WALL_COLOR;
                //Forward
                if(-45 < cameraDegrees && cameraDegrees < 45)
                {
                    targetWall = 3;
                }
                //Left
                else if(-135 < cameraDegrees && cameraDegrees < -45)
                {
                    targetWall = 0;
                }
                //right
                else if(45 < cameraDegrees && cameraDegrees < 135)
                {
                    targetWall = 1;
                }
                else
                {
                    targetWall = 2;
                }

                lookAroundCylinder.position.y = 0;
                window.setTimeout(function(){lookAroundCylinder.position.y = 2000}, 1000);
            };
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
        else if(state == EDIT_WALL_COLOR)
        {
            state = LOOK_AROUND;
            lookAroundCylinder.position.y = -1000;
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

