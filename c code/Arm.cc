#include "Arm.h"

<<<<<<< HEAD
double Arm::servoSpeed = 45 * Math.PI / 180;

Arm::Arm() {
	this->hardware = new RoboticArm();
}

double Arm::lerp(double v0, double v1, double t) {
    return v0 * (1 - t) + v1 * t;
}

double Arm::calculateTime(double start, double end) { // Radian angles
    return Math.abs(end - start) / servoSpeed;
}

double* Arm::anglesFromSides(double a, double b, double c) {
    double angles[] = {0,0,0};
    //TODO make sure the order is correct.
    angles[0] = (Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    angles[1] = (Math.acos((a * a + c * c - b * b) / (2 * a * c)));
    angles[2] = (Math.acos((a * a + b * b - c * c) / (2 * a * b)));

    return angles;
}

void Arm::moveServos() {
    var baseR = servos.base * Math.PI / 180 - Math.PI;
    // TODO convert tweenlite to speed.
    //base
    this->hardware.MoveServo(0);
    // shoulder
    this->hardware.MoveServo(1);
    // elbow
    this->hardware.MoveServo(2);
    // wrist
    this->hardware.MoveServo(3);

    TweenLite.to(arm.rotation, calculateTime(arm.rotation.y, baseR), {y: baseR, 'ease': Linear.easeNone});
    var shoulderR = servos.shoulder * Math.PI / 180 - Math.PI / 2;
    TweenLite.to(bones[0].rotation, calculateTime(bones[0].rotation.x, shoulderR), {x: shoulderR, 'ease': Linear.easeNone});
    var elbowR = servos.elbow * Math.PI / 180 - Math.PI;
    TweenLite.to(bones[1].rotation, calculateTime(bones[1].rotation.x, elbowR), {x: elbowR, 'ease': Linear.easeNone});
    var wristR = servos.wrist * Math.PI / 180 - Math.PI;
    TweenLite.to(bones[2].rotation, calculateTime(bones[2].rotation.x, wristR), {x: wristR, 'ease': Linear.easeNone});
}

void Arm::setServoAngles(double base, double shoulder, double elbow, double wrist) {
    this->base = base;
    this->shoulder = shoulder;
    this->elbow = elbow;
    this->wrist = wrist;
}

void Arm::moveArmToCartesian(double x, double y, double z) {
    double r = Math.sqrt(x * x + y * y + z * z);
    double theta = 0;
    double phi = 0;
    if(r != 0) {
        theta = Math.acos(y / r) * 180 / Math.PI;
        phi = Math.atan2(x, z) * 180 / Math.PI;
    }
    this.moveArmToSpherical(r, theta, phi);
}

void Arm::moveArmToSpherical(double radius, double theta, double phi) {
    // TODO negative?
    if(radius == 0) {
        radius = 1e-10;
    }
    // target.position.setFromSpherical(new THREE.Spherical(radius, theta * Math.PI / 180, phi * Math.PI / 180));

    double base = phi;
    double shoulder = 125.0;
    double elbow = 55.0;
    double wrist = 90.0;

    // TODO make this a static array
    double a = armSegmentLengths[0];
    double b = armSegmentLengths[1];
    double c = armSegmentLengths[2];
    
    double d = Math.sqrt(Math.pow(radius, 2) + Math.pow(c, 2));
    if(d < a + b) {
        double angles[] = anglesFromSides(a, b, d);
        elbow = angles[2] * 180 / Math.PI;
        shoulder = (Math.atan2(c, radius) + angles[1]) * 180 / Math.PI + 90 - theta;
        wrist = (Math.atan2(radius, c) + angles[0]) * 180 / Math.PI;
    }

    setServoAngles(base, shoulder, elbow, wrist);
}
=======
double Arm::servoSpeed = 45 * PI / 180;
double Arm::armSegmentLengths[] = {15.0, 12.5, 15.0};

Arm::Arm()  {
	this->hardware = new RoboticArm();
	this->currentPosition = {0, 42.5, 0};
	this->base = 90;
	this->shoulder = 90;
	this->elbow = 180;
	this->wrist = 180;
	this->moveServos();
}

double Arm::lerp(double v0, double v1, double t) {
	return v0 * (1 - t) + v1 * t;
}

void Arm::anglesFromSides(double *angles, double a, double b, double c) {
	angles[0] = (acos((b * b + c * c - a * a) / (2 * b * c)));
	angles[1] = (acos((a * a + c * c - b * b) / (2 * a * c)));
	angles[2] = (acos((a * a + b * b - c * c) / (2 * a * b)));
}

void Arm::moveServos() {
	int speed = 120;
	this->MoveServo(0, this->base, speed);
	this->MoveServo(1, this->shoulder, speed);
	this->MoveServo(2, this->elbow, speed);
	this->MoveServo(3, this->wrist, speed);

}

void Arm::setServoAngles(double base, double shoulder, double elbow, double wrist) {
	this->base = base;
	this->shoulder = shoulder;
	this->elbow = elbow;
	this->wrist = wrist;
	this->moveServos();
}

void Arm::moveArmToCartesian(double x, double y, double z) {
	double r = sqrt(x * x + y * y + z * z);
	double theta = 0;
	double phi = 0;
	if(r != 0) {
		theta = acos(y / r) * 180 / PI;
		phi = atan2(x, z) * 180 / PI;
	}
	struct Vector3 newPos = {x,y,z};
	this->currentPosition = newPos;

	this->moveArmToSpherical(r, theta, phi);
}

void Arm::moveArmToSpherical(double radius, double theta, double phi) {
	if(radius == 0) {
		radius = 1e-10;
	}

	double base = phi;
	double shoulder = 120.0;
	double elbow = 70;
	double wrist = 120;

	double a = armSegmentLengths[0];
	double b = armSegmentLengths[1];
	double c = armSegmentLengths[2];

	shoulder = acos((radius - b) / 2 / a) * 180 / PI;
	elbow = 180 - shoulder;
	wrist = elbow;
	shoulder += 90 - theta;

	setServoAngles(base, shoulder, elbow, wrist);
}

void Arm::moveArmAlongLine(double x, double y, double z) {
	struct Vector3 current = this->currentPosition;
	struct Vector3 dest = {x, y, z};
	int timeStep = 10;
	int danceInterval = 5000;
	double progress = (double) timeStep / danceInterval;
	for(int i = 0; i < danceInterval / timeStep; i++) {
		double x = lerp(current.x, dest.x, progress);
		double y = lerp(current.y, dest.y, progress);
		double z = lerp(current.z, dest.z, progress);
		std::cout << x << ", " << y << ", " << z << std::endl;
		moveArmToCartesian(x, y, z);
		progress += (double) timeStep / danceInterval;
		usleep(timeStep * 1000);
	}
}

void Arm::MoveServo(int id, int angle, int speed) {
	if(id == 2) {
		angle -= 25;
	}
	else if(id == 3) {
		angle -= 90;
	}

	this->hardware->MoveServo(id, std::min(std::max(angle, 0), 170), speed);
}
>>>>>>> 2c7b5a3cd9af3645b334b213bfeca9b252d99fee
