#ifndef ARM_H
#define ARM_H

#include <iostream>
#include <cmath>
#include "RoboticArm.h"

#define PI 3.1415926

struct Vector3 {
	double x;
	double y;
	double z;
};

class Arm {

	struct Vector3 currentPosition;

	double base, shoulder, elbow, wrist;

	RoboticArm *hardware;

public:

	static double servoSpeed;

	static double armSegmentLengths[];

	Arm();

	double lerp(double v0, double v1, double t);

	double calculateTime(double start, double end);

	void moveServos();

	void setServoAngles(double base, double shoulder, double elbow, double wrist);

	void moveArmToCartesian(double x, double y, double z);

	void anglesFromSides(double *angles, double a, double b, double c);

	void moveArmToSpherical(double radius, double theta, double phi);

	void moveArmAlongLine(double x, double y, double z);

	void MoveServo(int id, int angle, int speed);
};

#endif
