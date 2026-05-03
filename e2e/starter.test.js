/* eslint-env detox/detox, jest */
/* global device, expect, element, by, waitFor */
describe('Drivero App E2E', () => {
  jest.retryTimes(2);

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    // Instead of reload, we just ensure the app is in the right state or restart it
    await device.launchApp({ newInstance: true });
    // Ignore all network requests for synchronization to prevent timeouts
    await device.setURLBlacklist(['.*']);
  });

  it('should have login screen', async () => {
    await waitFor(element(by.text('Login to start driving'))).toBeVisible().withTimeout(10000);
  });

  it('should navigate to register screen', async () => {
    await waitFor(element(by.id('GoToRegisterButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('GoToRegisterButton')).tap();
    await waitFor(element(by.text('Join Drivero'))).toBeVisible().withTimeout(5000);
  });

  it('should show error when registering with empty fields', async () => {
    await waitFor(element(by.id('GoToRegisterButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('GoToRegisterButton')).tap();
    await waitFor(element(by.id('RegisterSubmitButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('RegisterSubmitButton')).tap();
    await waitFor(element(by.text('Please fill in all fields'))).toBeVisible().withTimeout(5000);
    await element(by.text('OK')).tap();
  });

  it('should show error when tapping login without credentials', async () => {
    await waitFor(element(by.id('LoginSubmitButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('LoginSubmitButton')).tap();
    await expect(element(by.text('Please enter both email and password'))).toBeVisible();
    await element(by.text('OK')).tap();
  });

  it('should show google map when login', async () => {
    // Using existing credentials for quick check
    await element(by.id('LoginEmailInput')).replaceText('test@example.com');
    await element(by.id('LoginPasswordInput')).replaceText('password123');
    await element(by.id('LoginSubmitButton')).tap();
    
    await waitFor(element(by.id('LiveMapView'))).toBeVisible().withTimeout(30000);
    await expect(element(by.id('LiveMapView'))).toBeVisible();
    
    // Logout to reset state for next test
    await element(by.id('LogoutButton')).tap();
  });

  it('should show location on google map when login and toggle online', async () => {
    await element(by.id('LoginEmailInput')).replaceText('test@example.com');
    await element(by.id('LoginPasswordInput')).replaceText('password123');
    await element(by.id('LoginSubmitButton')).tap();
    
    await waitFor(element(by.id('LiveMapView'))).toBeVisible().withTimeout(20000);
    
    // Toggle Online
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('ONLINE').withTimeout(20000);
    
    // Map should still be visible and updated with location
    await expect(element(by.id('LiveMapView'))).toBeVisible();
    
    // Toggle Offline and Logout
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(20000);
    await element(by.id('LogoutButton')).tap();
  });

  it('should handle full driver lifecycle: register, login, status toggle, and logout', async () => {
    const randomNum = Math.floor(Math.random() * 10000);
    const email = `driver_${randomNum}@example.com`;
    const name = `Driver_${randomNum}`;
    const password = 'password123';

    // 1. Register
    await waitFor(element(by.id('GoToRegisterButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('GoToRegisterButton')).tap();
    
    await waitFor(element(by.id('RegisterNameInput'))).toBeVisible().withTimeout(5000);
    await element(by.id('RegisterNameInput')).replaceText(name);
    await element(by.id('RegisterEmailInput')).replaceText(email);
    await element(by.id('RegisterPasswordInput')).replaceText(password);
    await element(by.id('RegisterPasswordInput')).tapReturnKey();
    await element(by.id('RegisterScrollView')).scrollTo('bottom');
    await element(by.id('RegisterSubmitButton')).tap();
    
    // Wait for success alert
    await waitFor(element(by.text('Success'))).toBeVisible().withTimeout(20000);
    await element(by.text('OK')).tap();

    // 2. Login
    await waitFor(element(by.id('LoginEmailInput'))).toBeVisible().withTimeout(10000);
    await element(by.id('LoginEmailInput')).replaceText(email);
    await element(by.id('LoginPasswordInput')).replaceText(password);
    await element(by.id('LoginPasswordInput')).tapReturnKey();
    await element(by.id('LoginSubmitButton')).tap();
    
    // Wait for Home Screen
    await waitFor(element(by.id('HomeScreenHeader'))).toBeVisible().withTimeout(20000);
    await expect(element(by.id('HomeScreenHeader'))).toHaveText(name);

    // 3. Status Toggle (Online)
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(5000);
    await element(by.id('OnlineStatusToggle')).tap();
    
    // Handle Permission popup if it appears (Android specific)
    try {
      await element(by.text('ALLOW')).tap();
    } catch (e) {}
    
    await waitFor(element(by.id('StatusValue'))).toHaveText('ONLINE').withTimeout(20000);
    
    // Verify Map is visible
    await waitFor(element(by.id('LiveMapView'))).toBeVisible().withTimeout(10000);

    // 4. Logout Restriction (Should fail while Online)
    await element(by.id('LogoutButton')).tap();
    await waitFor(element(by.text('Action Required'))).toBeVisible().withTimeout(5000);
    await element(by.text('OK')).tap();

    // 5. Status Toggle (Offline)
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(20000);

    // 6. Logout (Should succeed while Offline)
    await element(by.id('LogoutButton')).tap();
    await waitFor(element(by.id('LoginEmailInput'))).toBeVisible().withTimeout(10000);
  });
});
