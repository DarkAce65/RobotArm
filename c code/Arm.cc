#include "Arm.h"

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
