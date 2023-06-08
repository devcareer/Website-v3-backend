# **Website-V3-Backend**

## **Authentication Process**

This document provides an overview of the authentication endpoints available for user authentication and account management in your application. These endpoints allow users to sign up, log in, reset their password, recover a forgotten password, and verify their email address.

### **Endpoints**

#### **Signup**

**Endpoint:** ` /signup`

**Method:** POST

**Description:** Allows users to create a new account by providing their email address, password, and any other required information. Upon successful signup, a verification email may be sent to the user's email address.

**Request Parameters:**

- `email` (string, required): The email address of the user.
- `password` (string, required): The password for the new account.

**Response:**

- `201 Created`: The account was successfully created and verification email has been sent.

- `400 Bad Request`: User already exists.

- `409 Conflict`: The email address is already associated with an existing account.

#### **Login**

**Endpoint:** ` /login`

**Method:** POST

**Description:** Allows users to log in to their account by providing their email address and password. Upon successful login, an access token may be provided in the response for subsequent authenticated requests.

**Request Parameters:**

- `email` (string, required): The email address of the user.
- `password` (string, required): The password for the account.

**Response:**

- `200 OK`: The login was successful. An access token was included in the response.

- `400 Bad Request`: All fields are required.

- `401 Unauthorized`: The provided credentials are invalid.

- `401 Unauthorized`: Invalid credentials

**Reset Password Link**

**Endpoint:** ` /resetPasswordLink`

**Method:** POST

**Description:** Sends a password reset link to the user's email address. The link typically includes a unique token that allows the user to reset their password.

**Request Parameters:**

- `email` (string, required): The email address of the user.

**Response:**

- `201 OK`: The reset password link was successfully sent.

- `404 Not Found`: The email address does not exist in the system.

**Forgot Password**

**Endpoint:** `/forgotPassword`

**Method:** POST

**Description:** Allows users to reset their password by providing a new password along with a valid reset token. This endpoint is typically accessed via a password reset link sent to the user's email address.

**Request Parameters:**

- `resetToken` (string, required): The unique token sent to the user's email address.
- `newPassword` (string, required): The new password for the account.

**Response:**

- `200 OK`: The password was successfully reset.

- `400 Bad Request`: The request is missing required parameters or contains invalid data.

- `404 Not found:` The email does not exist in the system.

**Change Password**

**Endpoint:** `/changePassword`

**Method:** POST

**Description:** Allows users to change their password by providing their current password along with a new password.

**Request Parameters:**

- `currentPassword` (string, required): The user's current password.
- `newPassword` (string, required): The new password for the account.

**Response:**

- `200 OK`: The password was successfully changed.

- `400 Bad Request`: The request is missing required parameters or contains invalid data.

- `401 Unauthorized`: The provided current password is incorrect.

**Email Verification**

**Endpoint:** `/emailVerification`

**Method:** POST

**Description:** Verifies the user's email address based on a verification token typically included in a verification link sent to the user's email address duringduring the signup process.

**Request Parameters:**

- `verificationToken` (string, required): The unique token sent to the user's email address.

**Response:**

- `200 OK`: The account has been verified successfully.

- `400 Bad Request`: The request is missing required parameters or contains invalid data.

- `404 Not found`: User does not exist.

- `422 Unprocessable Entity`: Missing required token

## **Reason For Email Verification**

Email verification is an important step in the authentication process for several reasons:

1. Confirming the user's email address: Email verification ensures that the user has provided a valid and accessible email address. It helps prevent the creation of fake or spam accounts by requiring users to verify their email ownership.

2. Enhancing security: By verifying the user's email address, you add an extra layer of security to the authentication process. It reduces the risk of unauthorized access to user accounts by confirming that the email address associated with the account is under the user's control.

3. Preventing typos and mistakes: Email verification helps mitigate errors during the registration process. Users may mistype their email addresses, leading to failed or undeliverable communication. By verifying the email, you can detect and rectify such errors early on.

The email verification process typically involves the following steps:

- User registration: When a user registers for an account, they provide their email address along with other required information.

- Generating a verification token: A verification token is generated, which is a unique and secure code associated with the user's email address.

- Sending a verification email: An email is sent to the user's provided email address containing a verification link or instructions to verify their account.

- User action: The user receives the email and clicks on the verification link or follows the provided instructions to verify their email address.

- Verifying the token: The server receives the verification request and verifies the provided token against the generated token associated with the user's email address.

- Account activation: If the token is valid and matches the generated token, the user's account is considered verified, and they gain access to the application or platform.

During this process, it's essential to handle various scenarios, such as expired tokens, multiple verification attempts, and handling user interactions. Proper error handling and user feedback should be implemented to guide users through the verification process.

By incorporating email verification, you can ensure the integrity of user accounts, enhance security, and provide a more reliable and trustworthy authentication experience for your users.

## **Folder Structure**

```
\---.vscode
|
\---node_modules
|
\---src
|   |   app.js
|   |
|   +---api
|   |   +---admin
|   |   +---auth
|   |   |       authController.js
|   |   |       authRoutes.js
|   |   |
|   |   \---profile
|   +---lib
|   |       current-date-time.js
|   |
|   +---middleware
|   |       LogLimiter.js
|   |       pinoLogger.js
|   |
|   +---model
|   |       user.js
|   +---routes
|   |       index.js
|   |
|   \---service
|       \---email
|               sendEmail.js
|   |
|   |---app.js
\---.env
|
\---.env.example
|
\---.gitignore
|
\---.hintrc
|
\---.markdownlint.json
|
\---.pretttierrc
|
\---package.json
|
\---README.md
|
\---server.js
```
