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

    function vr(){
        if ( myCurrentSession === null ) {
            const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ] };
            navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );
        } else {
            myCurrentSession.end();
        }
    }

    async function onSessionStarted( session ) {
        session.addEventListener( 'end', onSessionEnded );
        await renderer.xr.setSession( session );
        myCurrentSession = session;
    }

    function onSessionEnded( /*event*/ ) {
        myCurrentSession.removeEventListener( 'end', onSessionEnded );
        myCurrentSession = null;
    }

    function checkVr(){
        console.clear();
        console.log(navigator.xr)
    }
	
    var serverLink = this;
    let myCurrentSession = null;
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
    document.getElementById('vr').addEventListener( 'click', vr, false );
    window.addEventListener( 'resize', onWindowResize );
    checkVr();
    init();
    buildScene();
    animate();
};