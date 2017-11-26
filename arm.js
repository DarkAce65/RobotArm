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
var scene, target, actual;
var servos, arm, bones;

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

function lawOfCosines(a, b, c) {
    return Math.acos((b * b + c * c - a * a) / (2 * b * c));
}

function moveArmToSpherical(radius, theta, phi) {
    if(radius == 0) {
        radius = 1e-10;
    }
    console.log(radius, theta, phi);
    target.position.setFromSpherical(new THREE.Spherical(radius, theta * Math.PI / 180, phi * Math.PI / 180));

    var base = phi;
    var shoulder = 90;
    var elbow = 180;
    var wrist = 180;

    var a = 10;
    var b = 40;
    var c = 50;

    var angleA = lawOfCosines(c, radius + a, b);
    var angleB = Math.asin((radius + a) * Math.sin(angleA) / c);
    var angleC = Math.asin(b * Math.sin(angleA) / c);
    console.log("A = " + (angleA * 180 / Math.PI));
    console.log("B = " + (angleB * 180 / Math.PI));
    console.log("C = " + (90 - theta + angleC * 180 / Math.PI));

    angleA = lawOfCosines(radius, a, b + c);
    angleC = Math.asin(a * Math.sin(angleA) / radius);
    console.log("A = " + (angleA * 180 / Math.PI));
    console.log("B = 180");
    console.log("C = " + (90 - theta + angleC * 180 / Math.PI));

    angleB = lawOfCosines(radius, a + b, c);
    angleC = Math.asin((a + b) * Math.sin(angleB) / radius);
    console.log("A = 180");
    console.log("B = " + (angleB * 180 / Math.PI));
    console.log("C = " + (90 - theta + angleC * 180 / Math.PI));
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

    var armSegmentLengths = [
        50, // Arm
        40, // Forearm
        10   // Hand
    ];

    var armLength = armSegmentLengths.reduce(function(a, b) {return a + b;}, 0);

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

    scene.add(arm);

    var gui = new dat.GUI();
    gui.add(armSkeleton.bones[0].rotation, 'x', -Math.PI, Math.PI);
    gui.add(armSkeleton.bones[1].rotation, 'x', -Math.PI, Math.PI);
    gui.add(armSkeleton.bones[2].rotation, 'x', -Math.PI, Math.PI);

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
