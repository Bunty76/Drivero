/* eslint-env detox/detox, jest */
/* global device, expect, element, by, waitFor */
describe('Drivero App E2E', () => {
  let testEmail = `driver_${Math.floor(Math.random() * 10000)}@test.com`;
  let testPassword = 'Password123!';
  
  jest.retryTimes(2);

  beforeAll(async () => {
    // stopSpecs: true can help with New Architecture synchronization issues during launch
    await device.launchApp({ newInstance: true, stopSpecs: true });
  });

  beforeEach(async () => {
    // Instead of reload, we just ensure the app is in the right state or restart it
    await device.launchApp({ newInstance: true });
    // Ignore all network requests for synchronization to prevent timeouts
    await device.setURLBlacklist(['.*']);
  });

  it('should have login screen', async () => {
    // Explicitly wait for the login screen to ensure synchronization is ready
    await waitFor(element(by.text('Login to start driving'))).toBeVisible().withTimeout(20000);
    await expect(element(by.text('Login to start driving'))).toBeVisible();
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

  it('should register a new driver', async () => {
    await waitFor(element(by.id('GoToRegisterButton'))).toBeVisible().withTimeout(5000);
    await element(by.id('GoToRegisterButton')).tap();
    
    await waitFor(element(by.id('RegisterNameInput'))).toBeVisible().withTimeout(5000);
    await element(by.id('RegisterNameInput')).replaceText('Test Driver');
    await element(by.id('RegisterEmailInput')).replaceText(testEmail);
    await element(by.id('RegisterPasswordInput')).replaceText(testPassword);
    await element(by.id('RegisterPasswordInput')).tapReturnKey();
    await element(by.id('RegisterScrollView')).scrollTo('bottom');
    await element(by.id('RegisterSubmitButton')).tap();
    
    // Wait for success alert
    await waitFor(element(by.text('Success'))).toBeVisible().withTimeout(20000);
    await element(by.text('OK')).tap();
    
    // Should be back at Login
    await expect(element(by.id('LoginEmailInput'))).toBeVisible();
  });

  it('should show google map when registered driver login and toggle offline', async () => {
    await element(by.id('LoginEmailInput')).replaceText(testEmail);
    await element(by.id('LoginPasswordInput')).replaceText(testPassword);
    await element(by.id('LoginSubmitButton')).tap();
    
    // Verify Map is visible even in OFFLINE mode
    await waitFor(element(by.id('LiveMapView'))).toBeVisible(50).withTimeout(20000);
    await expect(element(by.id('StatusValue'))).toHaveText('OFFLINE');
    
    // Logout to prepare for next test
    await element(by.id('LogoutButton')).tap();
  });

  it('should show location on google map when login and toggle online', async () => {
    await element(by.id('LoginEmailInput')).replaceText(testEmail);
    await element(by.id('LoginPasswordInput')).replaceText(testPassword);
    await element(by.id('LoginSubmitButton')).tap();
    
    await waitFor(element(by.id('LiveMapView'))).toBeVisible().withTimeout(20000);
    
    // Toggle Online
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('ONLINE').withTimeout(20000);
    
    // Map should still be visible (50% threshold for real devices)
    await expect(element(by.id('LiveMapView'))).toBeVisible(50);
    
    // Toggle Offline and Logout
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(20000);
    await element(by.id('LogoutButton')).tap();
  });

  it('should handle full driver lifecycle: status toggle and logout restrictions', async () => {
    // Login with the same credentials
    await waitFor(element(by.id('LoginEmailInput'))).toBeVisible().withTimeout(10000);
    await element(by.id('LoginEmailInput')).replaceText(testEmail);
    await element(by.id('LoginPasswordInput')).replaceText(testPassword);
    await element(by.id('LoginSubmitButton')).tap();
    
    // Wait for Home Screen
    await waitFor(element(by.id('HomeScreenHeader'))).toBeVisible().withTimeout(20000);

    // 1. Status Toggle (Online)
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(5000);
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('ONLINE').withTimeout(20000);
    
    // 2. Logout Restriction (Should fail while Online)
    await element(by.id('LogoutButton')).tap();
    await waitFor(element(by.text('Action Required'))).toBeVisible().withTimeout(5000);
    await element(by.text('OK')).tap();

    // 3. Status Toggle (Offline)
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(20000);

    // 4. Logout (Should succeed while Offline)
    await element(by.id('LogoutButton')).tap();
    await waitFor(element(by.id('LoginEmailInput'))).toBeVisible().withTimeout(10000);
  });
});
