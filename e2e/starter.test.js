/* eslint-env detox/detox, jest */
/* global device, expect, element, by */
describe('Drivero App E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have login screen', async () => {
    await expect(element(by.text('Login to start driving'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.id('GoToRegisterButton')).tap();
    await expect(element(by.text('Join Drivero'))).toBeVisible();
  });

  it('should show error when registering with empty fields', async () => {
    await element(by.id('GoToRegisterButton')).tap();
    await element(by.id('RegisterSubmitButton')).tap();
    await expect(element(by.text('Please fill in all fields'))).toBeVisible();
    await element(by.text('OK')).tap();
  });

  it('should show error when tapping login without credentials', async () => {
    await element(by.id('LoginSubmitButton')).tap();
    await expect(element(by.text('Please enter both email and password'))).toBeVisible();
    await element(by.text('OK')).tap();
  });

  it('should handle full driver lifecycle: register, login, status toggle, and logout', async () => {
    const randomNum = Math.floor(Math.random() * 10000);
    const email = `driver_${randomNum}@example.com`;
    const name = 'Test Driver';
    const password = 'password123';

    // 1. Register
    await element(by.id('GoToRegisterButton')).tap();
    await element(by.id('RegisterNameInput')).replaceText(name);
    await element(by.id('RegisterEmailInput')).replaceText(email);
    await element(by.id('RegisterPasswordInput')).replaceText(password);
    await element(by.id('RegisterPasswordInput')).tapReturnKey();
    await element(by.id('RegisterScrollView')).scrollTo('bottom');
    await element(by.id('RegisterSubmitButton')).tap();
    await waitFor(element(by.text('Success'))).toBeVisible().withTimeout(60000);
    await element(by.text('OK')).tap();

    // 2. Login
    await element(by.id('LoginEmailInput')).replaceText(email);
    await element(by.id('LoginPasswordInput')).replaceText(password);
    await element(by.id('LoginPasswordInput')).tapReturnKey();
    await element(by.id('LoginSubmitButton')).tap();
    await waitFor(element(by.id('HomeScreenHeader'))).toBeVisible().withTimeout(60000);
    await expect(element(by.text(`Welcome, ${name}`))).toBeVisible();

    // 3. Status Toggle (Online)
    await expect(element(by.id('StatusValue'))).toHaveText('OFFLINE');
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('ONLINE').withTimeout(20000);

    // 4. Logout Restriction (Should fail while Online)
    await element(by.id('LogoutButton')).tap();
    await expect(element(by.text('Cannot Logout'))).toBeVisible();
    await element(by.text('OK')).tap();

    // 5. Status Toggle (Offline)
    await element(by.id('OnlineStatusToggle')).tap();
    await waitFor(element(by.id('StatusValue'))).toHaveText('OFFLINE').withTimeout(20000);

    // 6. Logout (Should succeed while Offline)
    await element(by.id('LogoutButton')).tap();
    await expect(element(by.id('LoginEmailInput'))).toBeVisible();
  });
});
