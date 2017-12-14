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
    robotic_arm.moveArmAlongLine(-20, 20, 20);
}
