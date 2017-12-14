from xyz_to_servo import *
import matplotlib.pyplot as plt

if __name__ == '__main__':
    iterations = 0
    base_angles = []
    shoulder_angles = []
    elbow_angles = []
    wrist_angles = []

    def append_to_all(params):
        global iterations
        base_angles.append(params['base'].value)
        shoulder_angles.append(params['shoulder'].value)
        elbow_angles.append(params['elbow'].value)
        wrist_angles.append(params['wrist'].value)
        iterations += 1

    side_lengths = Sides(15.0, 12.5, 15.0)
    goal = (10.0, 19.775324885840586, 27.082213207835714)
    angle_guesses = (90, 90, 90)
    approximate_angles(goal, side_lengths, angle_guesses=angle_guesses, iter_cb=lambda *args: append_to_all(args[0]))

    print(base_angles)
    print(shoulder_angles)
    print(elbow_angles)
    print(wrist_angles)

    fig = plt.figure()
    frame = fig.add_axes((.1, .1, .7, .8))
    plt.plot(range(iterations), base_angles, range(iterations), shoulder_angles, range(iterations),
             elbow_angles, range(iterations), wrist_angles)
    frame.set_ylabel("Angle(degrees)")
    frame.set_xlabel("Algorithm Iterations")
    frame.set_title("goal = ({:0.3f}, {:0.3f}, {:0.3f})".format(*goal) + " initial guesses = " + str(angle_guesses), fontsize=9)
    fig.suptitle("Levenberg-Marquardt Least-Squares Minimization", x=0.45)
    frame.legend(["base", "shoulder", "elbow", "wrist"], bbox_to_anchor=(1, 1), loc=2, borderaxespad=0.)

    plt.show()