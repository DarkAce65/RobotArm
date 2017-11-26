'use strict';

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

var servoSpeed = 45 * Math.PI / 180; // Radians per second
var scene, gui, target, actual;
var armSegmentLengths, armLength, servos, arm, bones;

function calculateTime(start, end) { // Radian angles
    return Math.abs(end - start) / servoSpeed;
}

function moveServos() {
    var baseR = servos.base * Math.PI / 180 - Math.PI;
    TweenLite.to(arm.rotation, calculateTime(arm.rotation.y, baseR), {y: baseR});
    var shoulderR = servos.shoulder * Math.PI / 180 - Math.PI / 2;
    TweenLite.to(bones[0].rotation, calculateTime(bones[0].rotation.x, shoulderR), {x: shoulderR});
    var elbowR = servos.elbow * Math.PI / 180 - Math.PI;
    TweenLite.to(bones[1].rotation, calculateTime(bones[1].rotation.x, elbowR), {x: elbowR});
    var wristR = servos.wrist * Math.PI / 180 - Math.PI;
    TweenLite.to(bones[2].rotation, calculateTime(bones[2].rotation.x, wristR), {x: wristR});
}

function setServoAngles(base, shoulder, elbow, wrist) {
    servos.base = base;
    servos.shoulder = shoulder;
    servos.elbow = elbow;
    servos.wrist = wrist;
    for(var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }
    moveServos();
}

function moveArmToCartesian(x, y, z) {
    var r = Math.sqrt(x * x + y * y + z * z);
    var theta = 0;
    var phi = 0;
    if(r != 0) {
        theta = Math.acos(y / r) * 180 / Math.PI;
        phi = Math.atan2(x, z) * 180 / Math.PI;
    }
    moveArmToSpherical(r, theta, phi);
}

function anglesFromSides(a, b, c) {
    var angles = [];
    angles.push(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    angles.push(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
    angles.push(Math.acos((a * a + b * b - c * c) / (2 * a * b)));

    return angles;
}

function moveArmToSpherical(radius, theta, phi) {
    if(radius == 0) {
        radius = 1e-10;
    }
    console.log(radius, theta, phi);
    target.position.setFromSpherical(new THREE.Spherical(radius, theta * Math.PI / 180, phi * Math.PI / 180));

    var base = phi;
    var shoulder = 125;
    var elbow = 55;
    var wrist = 90;

    var a = armSegmentLengths[0];
    var b = armSegmentLengths[1];
    var c = armSegmentLengths[2];

    var d = Math.sqrt(Math.pow(radius, 2) + Math.pow(c, 2));
    if(d < a + b) {
        var angles = anglesFromSides(a, b, d);
        elbow = angles[2] * 180 / Math.PI;
        shoulder = (Math.atan2(c, radius) + angles[1]) * 180 / Math.PI + 90 - theta;
        wrist = (Math.atan2(radius, c) + angles[0]) * 180 / Math.PI;
    }

    setServoAngles(base, shoulder, elbow, wrist);
}

document.addEventListener('DOMContentLoaded', function(e) {
    function makeBones() {
        var arm = new THREE.Bone();
        var forearm = new THREE.Bone();
        var hand = new THREE.Bone();
        var end = new THREE.Bone();
        arm.add(forearm);
        forearm.add(hand);
        hand.add(end);

        arm.position.y = -armLength / 2;
        forearm.position.y = armSegmentLengths[0];
        hand.position.y = armSegmentLengths[1];
        end.position.y = armSegmentLengths[2];

        var bones = [];
        bones.push(arm);
        bones.push(forearm);
        bones.push(hand);
        bones.push(end);

        end.add(actual);
        end.add(new THREE.Mesh(new THREE.BoxBufferGeometry(2, 1, 2), new THREE.MeshBasicMaterial({color: 0x00ff00})));
        end.add(new THREE.PointLight(0x00ff00, 3, armLength / 4));

        return bones;
    }

    servos = {
        base: 0,
        shoulder: 90,
        elbow: 180,
        wrist: 180
    };

    armSegmentLengths = [
        50, // Arm
        40, // Forearm
        10   // Hand
    ];
    armLength = armSegmentLengths.reduce(function(a, b) {return a + b;}, 0);

    var clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    var renderer = new THREE.WebGLRenderer({antialias: true});
    document.querySelector('#rendererContainer').appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(armLength * 2, armLength, armLength * 2.6);
    var orbit = new THREE.OrbitControls(camera, renderer.domElement);
    camera.lookAt(scene.position);

    var lights = [];

    lights[0] = new THREE.AmbientLight(0x303030, 1);

    lights[1] = new THREE.PointLight(0xffffff, 1);
    lights[1].position.set(0, armLength * 1.2, 0);

    for(var i = 0; i < lights.length; i++) {
        scene.add(lights[i]);
    }

    var geometry = new THREE.PlaneGeometry(armLength * 2, armLength * 2);
    var material = new THREE.MeshPhongMaterial({color: 0x555555, side: THREE.DoubleSide});
    var floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    var geometry = new THREE.SphereGeometry(4);
    target = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff0000, wireframe: true}));
    target.position.y = armLength;
    scene.add(target);

    actual = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe: true}));

    var armGeometry = new THREE.BoxGeometry(3, armLength, 3, 1, armLength / 4);
    for(var i = 0; i < armGeometry.vertices.length; i++) {
        var vertex = armGeometry.vertices[i];
        var y = vertex.y + armLength / 2;

        var skinIndex;
        var skinWeight;
        if(y < armSegmentLengths[0]) {
            skinIndex = 0;
            skinWeight = y / armSegmentLengths[0];
        }
        else if(y < armSegmentLengths[0] + armSegmentLengths[1]) {
            skinIndex = 1;
            skinWeight = (y - armSegmentLengths[0]) / armSegmentLengths[1];
        }
        else {
            skinIndex = 2;
            skinWeight = (y - armSegmentLengths[0] - armSegmentLengths[1]) / armSegmentLengths[2];
        }

        armGeometry.skinIndices.push(new THREE.Vector4(skinIndex, 0, 0, 0));
        armGeometry.skinWeights.push(new THREE.Vector4(skinWeight, 0, 0, 0));
    }

    var material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: 0x111111,
        side: THREE.DoubleSide
    })
    arm = new THREE.SkinnedMesh(armGeometry, material);
    bones = makeBones();
    var armSkeleton = new THREE.Skeleton(bones);
    arm.add(bones[0]);
    arm.bind(armSkeleton);
    arm.position.y = armLength / 2;
    arm.rotation.y = -Math.PI;

    scene.add(arm);

    gui = new dat.GUI();
    gui.add(servos, 'base', -180, 180).onChange(function(value) {
        arm.rotation.y = value * Math.PI / 180 - Math.PI;
    });
    gui.add(servos, 'shoulder', 0, 180).onChange(function(value) {
        bones[0].rotation.x = value * Math.PI / 180 - Math.PI / 2;
    });
    gui.add(servos, 'elbow', 0, 180).onChange(function(value) {
        bones[1].rotation.x = value * Math.PI / 180 - Math.PI;
    });
    gui.add(servos, 'wrist', 0, 180).onChange(function(value) {
        bones[2].rotation.x = value * Math.PI / 180 - Math.PI;
    });

    function render() {
        requestAnimFrame(render);
        renderer.render(scene, camera);
    }

    render();

    window.addEventListener('resize', function() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});
