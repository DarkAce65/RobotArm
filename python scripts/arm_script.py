import numpy as np
import operator
from collections import namedtuple

Triangle = namedtuple("Triangle", "sides angles")
Arm = namedtuple("Arm", "sides angles")

Angles = namedtuple("Angles", "A B C")
Sides = namedtuple("Sides", "a b c")


def loc(a, C, b):
    """Return the missing side length c"""
    return np.sqrt(a**2 + b**2 - 2.0 * a * b * np.cos(np.deg2rad(C)))


def los(c, C, a):
    """Return the missing angle A"""
    return np.rad2deg(np.arcsin((np.sin(np.deg2rad(C)) * a)/c))


def SAS(a, C, b):
    c = loc(a, C, b)
    A = los(c, C, a)
    B = 180 - A - C
    return Triangle(Sides(a, b, c), Angles(A, B, C))


def calculate_xy(arm):
    """Given the angles of the servos, calculate the position of the end-effector in the plane of the joints."""
    a, b, c = arm.sides
    A, B, C = arm.angles

    sub_triangle_1 = SAS(b, C, c)
    sub_triangle_2 = SAS(a, B - sub_triangle_1.angles.B, sub_triangle_1.sides.c)

    # angle from radius to base
    theta = A - sub_triangle_2.angles.B

    # coords of arm
    x = sub_triangle_2.sides.c * np.cos(np.deg2rad(theta))
    y = sub_triangle_2.sides.c * np.sin(np.deg2rad(theta))

    return x, y


def end_effector(parameters, goal, arm_sides, base):
    """ Function to be minimized. How far is the actual position to desired?
    parameters: dictionary of angles that are changed to minize resids.
    goal: 3-tuple (x,y,z) of desired end effector
    arm: sides and angles of the robot arm
    base: angle of base servo
    """
    r, y = calculate_xy(Arm(arm_sides, Angles(parameters['shoulder'], parameters['elbow'], parameters['wrist'])))
    z = r * np.cos(np.deg2rad(base))
    x = r * np.sin((np.deg2rad(base)))

    resids = list(map(abs, map(operator.sub, goal, (x, y, z))))
    return resids


if __name__ == '__main__':
    robot_arm = Arm(Sides(15.0, 12.5, 15.0), Angles(90, 100, 180))
    goal = (0.0, 19.775324885840586, 27.082213207835714)

    #print(calculate_xy(robot_arm))
    #print(end_effector((), (0.0, 19.775324885840586, 27.082213207835714), robot_arm, 0))

    from lmfit import Parameters, Parameter, minimize, fit_report

    # define the starting values of the parameters of the minimized function
    shoulder = Parameter('shoulder', 90, min=0, max=180)
    elbow = Parameter('elbow', 99, min=0, max=180)
    wrist = Parameter('wrist', 175, min=0, max=180)
    params = Parameters()
    params.add_many(shoulder, elbow, wrist)


    # The base servo angle can be calculated and fixed.
    base = np.arctan(goal[0]/goal[2])

    print(end_effector(params, (0.0, 19.775324885840586, 27.082213207835714), robot_arm.sides, base))

    result = minimize(end_effector, params, args=(goal, robot_arm.sides, base),
             iter_cb=params.pretty_print(), method="leastsq")

    print(fit_report(result.params))
