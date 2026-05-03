const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnGetUsers, fnGetUserWithPasswordByEmail, fnGetUserWithPasswordByPhone, fnCreateUser } = require('../models/userModel');
const { fnHashPassword, fnVerifyPassword } = require('../utils/password');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const cNameRegex = /^[A-Za-z\s'-]+$/;
const cEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cPhoneRegex = /^\d{3}-\d{3}-\d{4}$/;

const fnListAuthenticatedUsers = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = cRequest.query.userId ? fnRequirePositiveInteger(cRequest.query.userId, 'userId') : null;
  const cEmail = cRequest.query.email ? fnRequireString(cRequest.query.email, 'email') : null;
  const cPhone = cRequest.query.phone ? fnRequireString(cRequest.query.phone, 'phone') : null;
  const aUsers = await fnGetUsers(nUserId, cEmail, cPhone);
  cResponse.status(200).json(aUsers);
});

const fnSignUp = fnAsyncHandler(async (cRequest, cResponse) => {
  const cFirstName = fnRequireString(cRequest.body.firstName, 'First name');
  const cLastName = fnRequireString(cRequest.body.lastName, 'Last name');
  const cEmail = fnRequireString(cRequest.body.email, 'Email').toLowerCase();
  const cPhone = typeof cRequest.body.phone === 'string' ? cRequest.body.phone.trim() : '';
  const cPassword = fnRequireString(cRequest.body.password, 'Password');

  if (!cNameRegex.test(cFirstName)) {
    throw fnCreateError(400, 'First name can only contain letters, spaces, apostrophes, and hyphens.');
  }

  if (!cNameRegex.test(cLastName)) {
    throw fnCreateError(400, 'Last name can only contain letters, spaces, apostrophes, and hyphens.');
  }

  if (!cEmailRegex.test(cEmail)) {
    throw fnCreateError(400, 'Email Address must be a valid format (example@domain.com).');
  }

  if (cPhone && !cPhoneRegex.test(cPhone)) {
    throw fnCreateError(400, 'Phone Number must be in the format 123-456-7890.');
  }

  if (cPassword.length < 8) {
    throw fnCreateError(400, 'Password must be at least 8 characters long.');
  }

  if ((await fnGetUserWithPasswordByEmail(cEmail))[0]) {
    throw fnCreateError(409, 'An account with that email already exists.');
  }

  if (cPhone && (await fnGetUserWithPasswordByPhone(cPhone))[0]) {
    throw fnCreateError(409, 'An account with that phone number already exists.');
  }

  const cUser = await fnCreateUser({
    firstName: cFirstName,
    lastName: cLastName,
    email: cEmail,
    phone: cPhone || null,
    preferredContact: 'email',
    passwordHash: fnHashPassword(cPassword)
  });

  cResponse.status(201).json(cUser);
});

const fnSignIn = fnAsyncHandler(async (cRequest, cResponse) => {
  const cEmail = typeof cRequest.body.email === 'string' ? cRequest.body.email.trim().toLowerCase() : '';
  const cPhone = typeof cRequest.body.phone === 'string' ? cRequest.body.phone.trim() : '';
  const cPassword = fnRequireString(cRequest.body.password, 'Password');

  if (!cEmail && !cPhone) {
    throw fnCreateError(400, 'Sign in requires either an email address or a phone number.');
  }

  if (cEmail && !cEmailRegex.test(cEmail)) {
    throw fnCreateError(400, 'Email Address must be a valid format (example@domain.com).');
  }

  if (cPhone && !cPhoneRegex.test(cPhone)) {
    throw fnCreateError(400, 'Phone Number must be in the format 123-456-7890.');
  }

  const cUserRecord = cEmail
    ? (await fnGetUserWithPasswordByEmail(cEmail))[0]
    : (await fnGetUserWithPasswordByPhone(cPhone))[0];

  if (!cUserRecord || !fnVerifyPassword(cPassword, cUserRecord.passwordHash)) {
    throw fnCreateError(401, 'Invalid sign in credentials.');
  }

  cResponse.status(200).json({
    userId: cUserRecord.userId,
    firstName: cUserRecord.firstName,
    lastName: cUserRecord.lastName,
    email: cUserRecord.email,
    phone: cUserRecord.phone,
    preferredContact: cUserRecord.preferredContact
  });
});

module.exports = {
  fnListAuthenticatedUsers,
  fnSignUp,
  fnSignIn
};
