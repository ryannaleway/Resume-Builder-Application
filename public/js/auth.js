document.addEventListener('DOMContentLoaded', () => {
  const oExistingUser = fnGetCurrentUser();

  if (oExistingUser) {
    window.location.href = '/';
    return;
  }

  document.getElementById('signUpForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();

    try {
      const oUser = await fnApiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: document.getElementById('signUpFirstName').value,
          lastName: document.getElementById('signUpLastName').value,
          email: document.getElementById('signUpEmail').value,
          password: document.getElementById('signUpPassword').value
        })
      });

      fnSetCurrentUser(oUser);
      await Swal.fire({
        icon: 'success',
        title: 'Account created',
        text: 'Your profile information will now appear in the resume header.'
      });
      window.location.href = '/';
    } catch (cError) {
      await Swal.fire({
        icon: 'error',
        title: 'Sign up failed',
        text: cError.message
      });
    }
  });

  document.getElementById('signInForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();

    try {
      const oUser = await fnApiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('signInEmail').value,
          password: document.getElementById('signInPassword').value
        })
      });

      fnSetCurrentUser(oUser);
      await Swal.fire({
        icon: 'success',
        title: 'Signed in',
        text: 'Welcome back.'
      });
      window.location.href = '/';
    } catch (cError) {
      await Swal.fire({
        icon: 'error',
        title: 'Sign in failed',
        text: cError.message
      });
    }
  });
});
