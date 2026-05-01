const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnGetUsers, fnGetUserWithPasswordByEmail, fnCreateUser } = require('../models/userModel');
const { fnHashPassword, fnVerifyPassword } = require('../utils/password');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListAuthenticatedUsers = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = cRequest.query.userId ? fnRequirePositiveInteger(cRequest.query.userId, 'userId') : null;
  const cEmail = cRequest.query.email ? fnRequireString(cRequest.query.email, 'email') : null;
  const aUsers = await fnGetUsers(nUserId, cEmail);
  cResponse.status(200).json(aUsers);
});

const fnSignUp = fnAsyncHandler(async (cRequest, cResponse) => {
  const cFirstName = fnRequireString(cRequest.body.firstName, 'First name');
  const cLastName = fnRequireString(cRequest.body.lastName, 'Last name');
  const cEmail = fnRequireString(cRequest.body.email, 'Email').toLowerCase();
  const cPassword = fnRequireString(cRequest.body.password, 'Password');

  if (cPassword.length < 8) {
    throw fnCreateError(400, 'Password must be at least 8 characters long.');
  }

  if ((await fnGetUserWithPasswordByEmail(cEmail))[0]) {
    throw fnCreateError(409, 'An account with that email already exists.');
  }

  const cUser = await fnCreateUser({
    firstName: cFirstName,
    lastName: cLastName,
    email: cEmail,
    passwordHash: fnHashPassword(cPassword)
  });

  cResponse.status(201).json(cUser);
});

const fnSignIn = fnAsyncHandler(async (cRequest, cResponse) => {
  const cEmail = fnRequireString(cRequest.body.email, 'Email').toLowerCase();
  const cPassword = fnRequireString(cRequest.body.password, 'Password');
  const cUserRecord = (await fnGetUserWithPasswordByEmail(cEmail))[0];

  if (!cUserRecord || !fnVerifyPassword(cPassword, cUserRecord.passwordHash)) {
    throw fnCreateError(401, 'Invalid email or password.');
  }

  cResponse.status(200).json({
    userId: cUserRecord.userId,
    firstName: cUserRecord.firstName,
    lastName: cUserRecord.lastName,
    email: cUserRecord.email
  });
});

module.exports = {
  fnListAuthenticatedUsers,
  fnSignUp,
  fnSignIn
};
