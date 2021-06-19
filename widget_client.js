api.controller=function() {
    function init() {
        container = document.getElementById('threejs');
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x808080 );
        // camera
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.rotation.order = 'YXZ'
        // light
        scene.add(new THREE.AmbientLight(0xffffff));
        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        container.appendChild( renderer.domElement );
        // Create player object
        player = new THREE.Object3D();
        player.rotation.y = Math.PI * 0.25;
        player.position.y = 1.8;
        scene.add(player);
        player.add(camera);
        // vr button
        document.body.appendChild(VRButton.createButton(renderer));
    }

    function buildScene(){
        var roomSize = 100;
        var xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue;
        //floor
        xCenter = 0;
        xSize = roomSize;
        yCenter = -1;
        ySize = 2;
        zCenter = 0;
        zSize = roomSize;
        red = 0.8;
        green = 0.8;
        blue = 0.8;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
        //roof
        xCenter = 0;
        xSize = roomSize;
        yCenter = (roomSize * 0.5) + 1;
        ySize = 2;
        zCenter = 0;
        zSize = roomSize;
        red = 0.8;
        green = 0.8;
        blue = 0.8;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
        //wall x
        xCenter = (roomSize * 0.5) + 1;
        xSize = 2;
        yCenter = roomSize * 0.25;
        ySize = (roomSize * 0.5);
        zCenter = 0;
        zSize = roomSize;
        red = 0.7;
        green = 0.7;
        blue = 0.7;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
        //wall -x
        xCenter = 0 - (roomSize * 0.5) - 1;
        xSize = 2;
        yCenter = roomSize * 0.25;
        ySize = (roomSize * 0.5);
        zCenter = 0;
        zSize = roomSize;
        red = 0.7;
        green = 0.7;
        blue = 0.7;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
        //wall +z
        xCenter = 0;
        xSize = roomSize;
        yCenter = roomSize * 0.25;
        ySize = (roomSize * 0.5);
        zCenter = (roomSize * 0.5) + 1;
        zSize = 2;
        red = 0.6;
        green = 0.6;
        blue = 0.6;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
        //wall -z
        xCenter = 0;
        xSize = roomSize;
        yCenter = roomSize * 0.25;
        ySize = (roomSize * 0.5);
        zCenter = 0 - (roomSize * 0.5) - 1;
        zSize = 2;
        red = 0.6;
        green = 0.6;
        blue = 0.6;
        cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue)
    }

    function cuboid(xCenter,xSize,yCenter,ySize,zCenter,zSize,red,green,blue){
        var edges;
        var geometry;
        var line;
        var material;
        var mesh;
        geometry = new THREE.BoxGeometry(xSize, ySize, zSize);
        material = new THREE.MeshStandardMaterial();
        material.color.setRGB(red,green,blue);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = xCenter;
        mesh.position.y = yCenter;
        mesh.position.z = zCenter;
        scene.add(mesh);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render() {
        renderer.render(scene, camera);
    }

    function onDocumentMouseMove(event) {
        event.preventDefault();
        if (isMouseDown) {
            camera.rotation.y = tempCameraRotationY + ((event.clientX - onMouseDownPositionX) * 0.002);
            camera.rotation.x = tempCameraRotationX + ((event.clientY - onMouseDownPositionY) * 0.002);
        }
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();
        isMouseDown = true;
        onMouseDownPositionX = event.clientX;
        onMouseDownPositionY = event.clientY;
        tempCameraRotationY = camera.rotation.y;
        tempCameraRotationX = camera.rotation.x;
    }

    function onDocumentMouseUp(event) {
        event.preventDefault();
        isMouseDown = false;
    }


    class VRButton {
        static createButton( renderer, options ) {
            if ( options ) {
                console.error( 'THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.' );
            }
            const button = document.createElement( 'button' );
            function showEnterVR( /*device*/ ) {
                let currentSession = null;
                async function onSessionStarted( session ) {
                    session.addEventListener( 'end', onSessionEnded );
                    await renderer.xr.setSession( session );
                    button.textContent = 'EXIT VR';
                    currentSession = session;
                }
                function onSessionEnded( /*event*/ ) {
                    currentSession.removeEventListener( 'end', onSessionEnded );
                    button.textContent = 'ENTER VR';
                    currentSession = null;
                }
                button.style.display = '';
                button.style.cursor = 'pointer';
                button.style.left = 'calc(50% - 50px)';
                button.style.width = '100px';
                button.textContent = 'ENTER VR';
                button.onmouseenter = function () {
                    button.style.opacity = '1.0';
                };
                button.onmouseleave = function () {
                    button.style.opacity = '0.5';
                };
                button.onclick = function () {
                    if ( currentSession === null ) {
                        // WebXR's requestReferenceSpace only works if the corresponding feature
                        // was requested at session creation time. For simplicity, just ask for
                        // the interesting ones as optional features, but be aware that the
                        // requestReferenceSpace call will fail if it turns out to be unavailable.
                        // ('local' is always available for immersive sessions and doesn't need to
                        // be requested separately.)
                        const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ] };
                        navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );
                    } else {
                        currentSession.end();
                    }
                };
            }
            function disableButton() {
                button.style.display = '';
                button.style.cursor = 'auto';
                button.style.left = 'calc(50% - 75px)';
                button.style.width = '150px';
                button.onmouseenter = null;
                button.onmouseleave = null;
                button.onclick = null;
            }
            function showWebXRNotFound() {
                disableButton();
                button.textContent = 'VR NOT SUPPORTED';
            }
            function stylizeElement( element ) {
                element.style.position = 'absolute';
                element.style.bottom = '20px';
                element.style.padding = '12px 6px';
                element.style.border = '1px solid #fff';
                element.style.borderRadius = '4px';
                element.style.background = 'rgba(0,0,0,0.1)';
                element.style.color = '#fff';
                element.style.font = 'normal 13px sans-serif';
                element.style.textAlign = 'center';
                element.style.opacity = '0.5';
                element.style.outline = 'none';
                element.style.zIndex = '999';
            }
            if ( 'xr' in navigator ) {
                button.id = 'VRButton';
                button.style.display = 'none';
                stylizeElement( button );
                navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {
                    supported ? showEnterVR() : showWebXRNotFound();
                } );
                return button;
            } else {
                const message = document.createElement( 'a' );
                if ( window.isSecureContext === false ) {
                    message.href = document.location.href.replace( /^http:/, 'https:' );
                    message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
                } else {
                    message.href = 'https://immersiveweb.dev/';
                    message.innerHTML = 'WEBXR NOT AVAILABLE';
                }
                message.style.left = 'calc(50% - 90px)';
                message.style.width = '180px';
                message.style.textDecoration = 'none';
                stylizeElement( message );
                return message;
            }
        }
    }
    
    var serverLink = this;
    let container;
    let camera, scene, renderer;
    let player;
    // globals
    var isMouseDown = false;
    var onMouseDownPositionX = 0;
    var onMouseDownPositionY = 0;
    var tempCameraRotationY = 0;
    var tempCameraRotationX = 0;
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    window.addEventListener( 'resize', onWindowResize );
    init();
    buildScene();
    animate();
};