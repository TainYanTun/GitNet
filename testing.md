# Project Test Cases

## Feature A

### Test Case 1: User Login
**Description**: Verify that a registered user can log in successfully.
**Steps**:
1. Navigate to the login page.
2. Enter valid credentials (username: `testuser`, password: `password123`).
3. Click the "Login" button.
**Expected Result**: User is redirected to the dashboard.

### Test Case 2: Invalid Login
**Description**: Verify that an unregistered user or invalid credentials result in a login failure.
**Steps**:
1. Navigate to the login page.
2. Enter invalid credentials (username: `invalid`, password: `wrong`).
3. Click the "Login" button.
**Expected Result**: An error message "Invalid credentials" is displayed.

## Feature B

### Test Case 3: Create New Repository
**Description**: Verify that a user can create a new local Git repository.
**Steps**:
1. Open the application.
2. Select "New Repository" from the menu.
3. Choose an empty folder and provide a name.
4. Click "Create".
**Expected Result**: A new Git repository is initialized in the chosen folder and displayed in the app.

---

# Test Results Summary

- Last run: 2025-12-25 10:30 AM
- Total tests: 3
- Passed: 2
- Failed: 1 (Invalid Login - expected "Invalid credentials" but got "Authentication failed")