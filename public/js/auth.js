document.addEventListener('DOMContentLoaded', () => {
  const oExistingUser = fnGetCurrentUser();

  if (oExistingUser) {
    window.location.href = '/';
    return;
  }

  const fnFormatPhoneNumberInput = (cInputId) => {
    const cInput = document.getElementById(cInputId);

    if (!cInput) {
      return;
    }

    // Auto-format phone number with the 3-3-4 pattern while the user types so
    // we can keep the UI friendly and also keep validation messages simple.
    cInput.addEventListener('input', (cEvent) => {
      let cValue = cEvent.target.value.replace(/\D/g, '');

      if (cValue.length > 10) {
        cValue = cValue.slice(0, 10);
      }

      if (cValue.length > 6) {
        cValue = `${cValue.slice(0, 3)}-${cValue.slice(3, 6)}-${cValue.slice(6)}`;
      } else if (cValue.length > 3) {
        cValue = `${cValue.slice(0, 3)}-${cValue.slice(3)}`;
      }

      cEvent.target.value = cValue;
    });
  };

  fnFormatPhoneNumberInput('phone');
  fnFormatPhoneNumberInput('signInPhone');

  const fnValidateSignUpForm = () => {
    const aErrors = [];
    const cFirstName = document.getElementById('txtFirstName').value.trim();
    const cLastName = document.getElementById('txtLastName').value.trim();
    const cEmail = document.getElementById('txtEmail').value.trim();
    const cPhone = document.getElementById('phone').value.trim();
    const cPassword = document.getElementById('txtPassword').value.trim();

    const cNameRegex = /^[A-Za-z\s'-]+$/;
    const cEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cPhoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!cFirstName) {
      aErrors.push('First Name is required.');
    } else if (!cNameRegex.test(cFirstName)) {
      aErrors.push('First Name can only contain letters, spaces, apostrophes, and hyphens.');
    }

    if (!cLastName) {
      aErrors.push('Last Name is required.');
    } else if (!cNameRegex.test(cLastName)) {
      aErrors.push('Last Name can only contain letters, spaces, apostrophes, and hyphens.');
    }

    if (!cEmail) {
      aErrors.push('Email Address is required.');
    } else if (!cEmailRegex.test(cEmail)) {
      aErrors.push('Email Address must be a valid format (example@domain.com).');
    }

    if (cPhone && !cPhoneRegex.test(cPhone)) {
      aErrors.push('Phone Number must be in the format 123-456-7890.');
    }

    if (!cPassword) {
      aErrors.push('Password is required.');
    } else if (cPassword.length < 8) {
      aErrors.push('Password must be at least 8 characters long.');
    }

    return {
      aErrors,
      cFirstName,
      cLastName,
      cEmail,
      cPhone,
      cPassword
    };
  };

  const fnValidateSignInForm = () => {
    const aErrors = [];
    const cEmail = document.getElementById('txtSignInEmail').value.trim();
    const cPhone = document.getElementById('signInPhone').value.trim();
    const cPassword = document.getElementById('txtSignInPassword').value.trim();
    const cEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cPhoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!cEmail && !cPhone) {
      aErrors.push('Enter either an Email Address or a Phone Number to sign in.');
    }

    if (cEmail && !cEmailRegex.test(cEmail)) {
      aErrors.push('Email Address must be a valid format (example@domain.com).');
    }

    if (cPhone && !cPhoneRegex.test(cPhone)) {
      aErrors.push('Phone Number must be in the format 123-456-7890.');
    }

    if (!cPassword) {
      aErrors.push('Password is required.');
    }

    return {
      aErrors,
      cEmail,
      cPhone,
      cPassword
    };
  };

  document.getElementById('signUpForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    const oValidation = fnValidateSignUpForm();

    if (oValidation.aErrors.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Please fix the following',
        html: `<ul class="text-start mb-0">${oValidation.aErrors.map((cError) => `<li>${cError}</li>`).join('')}</ul>`
      });
      return;
    }

    try {
      const oUser = await fnApiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: oValidation.cFirstName,
          lastName: oValidation.cLastName,
          email: oValidation.cEmail,
          phone: oValidation.cPhone,
          password: oValidation.cPassword
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
    const oValidation = fnValidateSignInForm();

    if (oValidation.aErrors.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Please fix the following',
        html: `<ul class="text-start mb-0">${oValidation.aErrors.map((cError) => `<li>${cError}</li>`).join('')}</ul>`
      });
      return;
    }

    try {
      const oUser = await fnApiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: oValidation.cEmail,
          phone: oValidation.cPhone,
          password: oValidation.cPassword
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
