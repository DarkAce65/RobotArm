#include "RoboticArm.h"

RoboticArm::RoboticArm() {
    fd = open("/dev/mem", O_RDWR); // Open memory mapped I/O
    ptr = (char *) mmap(NULL, 0xff, PROT_READ | PROT_WRITE,
        MAP_SHARED, fd, 0x400d0000); // Map physical memory

    if(ptr == (void *) -1) { // Check success
        std::cerr << "Error mapping memory - fogot sudo?\n";
        exit(1);
    }

    for(int i = 0; i < 5; i++) // Initial servo positions
        MoveServo(i, 90, 180);
}

RoboticArm::~RoboticArm() {
    munmap(ptr, 0xff); // Unmap physical memory
    close(fd); // Close memory mapped I/O
}

void RoboticArm::RegisterWrite(unsigned offset, unsigned value) {
    *(volatile unsigned *) (ptr + offset) = value;
}

void RoboticArm::MoveServo(int id, int angle, int speed) {
    if(id < 0 || id > 4) { // Check valid servo
        std::cerr << "Invalid servo ID\n";
        exit(1);
    }

    if(angle < 0 || angle > 180) { // Verify valid angle
        std::cerr << "Invalid angle\n";
        exit(1);
    }

    // Set memory locations
    RegisterWrite(0x100 + id * 8, angle);
    RegisterWrite(0x100 + id * 8 + 4, speed);
}
