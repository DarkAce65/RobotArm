<<<<<<< HEAD
#include "RoboticArm.h"
#include <unistd.h>

int main() {
    RoboticArm robotic_arm;

	
	robotic_arm.MoveServo(1, 35, 30);	
	sleep(6);
	robotic_arm.MoveServo(4, 0, 45);
	sleep(1);

	robotic_arm.MoveServo(1, 135, 200);
	robotic_arm.MoveServo(2, 165, 150);
	usleep(500000);
	robotic_arm.MoveServo(4, 100, 255);

    while(false) {
        robotic_arm.MoveServo(4, 45, 45);
        robotic_arm.MoveServo(3, 45, 45);
        sleep(1);

        robotic_arm.MoveServo(4, 90, 45);
        robotic_arm.MoveServo(3, 90, 45);
        sleep(1);
    }
=======
#include <unistd.h>
#include "Arm.h"
#include <iostream>

int main() {
    Arm robotic_arm;
    robotic_arm.moveArmToCartesian(-20, 0, 20);
    sleep(2);

    robotic_arm.moveArmAlongLine(20, 0, 20);
    sleep(1);
    robotic_arm.moveArmAlongLine(20, 0, 10);
    sleep(1);
    robotic_arm.moveArmAlongLine(-20, 0, 10);
    sleep(1);
    robotic_arm.moveArmAlongLine(-20, 20, 10);
    sleep(1);
    robotic_arm.moveArmAlongLine(20, 20, 10);
    sleep(1);
    robotic_arm.moveArmAlongLine(20, 20, 20);
    sleep(1);
    robotic_arm.moveArmToCartesian(-20, 20, 20);
>>>>>>> 2c7b5a3cd9af3645b334b213bfeca9b252d99fee
}
