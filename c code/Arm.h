#ifndef ARM_H
#define ARM_H


#include <iostream>
#include<Math>
#include "RoboticArm.h"

class Arm {

	double base, shoulder, elbow, wrist;

    RoboticArm hardware;
	
public:

	static double servoSpeed;

	Arm();
	
	double lerp(double v0, double v1, double t);
	
	double calculateTime(double start, double end);

	void moveServos();
    
	void setServoAngles(base, shoulder, elbow, wrist);

    void moveArmToCartesian(double x, double y, double z);

	double *anglesFromSides(double a, double b, double c);

	void moveArmToSpherical(double radius, double theta, double phi);
};

#endif