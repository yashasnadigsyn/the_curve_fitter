import numpy as np

# True curve parameters
true_k0, true_k1, true_k2, true_k3, true_k4, true_k5 = 10, 11, 12, -13, 32, -1

# Generate data points from the true curve
x = np.linspace(-1, 1, 100)
y = true_k0 + true_k1 * x + true_k2 * x**2 + true_k3 * x**3 + true_k4 * x**4 + true_k5 * x**5

# Initialize parameters
k0, k1, k2, k3, k4, k5 = 0, 0, 0, 0, 0, 0
num_iterations = 100

# Define the cost function (Mean Squared Error)
def cost_function(k0, k1, k2, k3, k4, k5, x, y):
    y_pred = k0 + k1 * x + k2 * x**2 + k3 * x**3 + k4 * x**4 + k5 * x**5
    return np.mean((y - y_pred)**2)

# Define the gradient of the cost function
def gradient(k0, k1, k2, k3, k4, k5, x, y):
    y_pred = k0 + k1 * x + k2 * x**2 + k3 * x**3 + k4 * x**4 + k5 * x**5
    dk0 = -2 * np.mean(y - y_pred)
    dk1 = -2 * np.mean((y - y_pred) * x)
    dk2 = -2 * np.mean((y - y_pred) * x**2)
    dk3 = -2 * np.mean((y - y_pred) * x**3)
    dk4 = -2 * np.mean((y - y_pred) * x**4)
    dk5 = -2 * np.mean((y - y_pred) * x**5)
    return np.array([dk0, dk1, dk2, dk3, dk4, dk5])

# Define the Hessian of the cost function
def hessian(k0, k1, k2, k3, k4, k5, x, y):
    y_pred = k0 + k1 * x + k2 * x**2 + k3 * x**3 + k4 * x**4 + k5 * x**5
    dk0_dk0 = 2 * np.mean(np.ones_like(x))
    dk0_dk1 = 2 * np.mean(x)
    dk0_dk2 = 2 * np.mean(x**2)
    dk1_dk1 = 2 * np.mean(x**2)
    dk1_dk2 = 2 * np.mean(x**3)
    dk2_dk2 = 2 * np.mean(x**4)
    dk0_dk3 = 2 * np.mean(x**3)
    dk1_dk3 = 2 * np.mean(x**4)
    dk2_dk3 = 2 * np.mean(x**5)
    dk3_dk3 = 2 * np.mean(x**6)
    dk0_dk4 = 2 * np.mean(x**4)
    dk1_dk4 = 2 * np.mean(x**5)
    dk2_dk4 = 2 * np.mean(x**6)
    dk3_dk4 = 2 * np.mean(x**7)
    dk4_dk4 = 2 * np.mean(x**8)
    dk0_dk5 = 2 * np.mean(x**5)
    dk1_dk5 = 2 * np.mean(x**6)
    dk2_dk5 = 2 * np.mean(x**7)
    dk3_dk5 = 2 * np.mean(x**8)
    dk4_dk5 = 2 * np.mean(x**9)
    dk5_dk5 = 2 * np.mean(x**10)
    return np.array([[dk0_dk0, dk0_dk1, dk0_dk2, dk0_dk3, dk0_dk4, dk0_dk5],
                     [dk0_dk1, dk1_dk1, dk1_dk2, dk1_dk3, dk1_dk4, dk1_dk5],
                     [dk0_dk2, dk1_dk2, dk2_dk2, dk2_dk3, dk2_dk4, dk2_dk5],
                     [dk0_dk3, dk1_dk3, dk2_dk3, dk3_dk3, dk3_dk4, dk3_dk5],
                     [dk0_dk4, dk1_dk4, dk2_dk4, dk3_dk4, dk4_dk4, dk4_dk5],
                     [dk0_dk5, dk1_dk5, dk2_dk5, dk3_dk5, dk4_dk5, dk5_dk5]])

# Newton's method
for iteration in range(num_iterations):
    # Compute the gradient and Hessian
    grad = gradient(k0, k1, k2, k3, k4, k5, x, y)
    hess = hessian(k0, k1, k2, k3, k4, k5, x, y)

    # Update parameters
    delta = np.linalg.solve(hess, grad)
    k0 -= delta[0]
    k1 -= delta[1]
    k2 -= delta[2]
    k3 -= delta[3]
    k4 -= delta[4]
    k5 -= delta[5]

    # Print progress
    if iteration % 10 == 0:
        print(f"Iteration {iteration}: k0 = {k0}, k1 = {k1}, k2 = {k2}, k3 = {k3}, k4 = {k4}, k5 = {k5}")

print(f"Final coefficients: k0 = {k0}, k1 = {k1}, k2 = {k2}, k3 = {k3}, k4 = {k4}, k5 = {k5}")
