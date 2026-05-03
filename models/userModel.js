const { fnRun, fnAll } = require('../db/database');

const fnGetUsers = async (nUserId, cEmail, cPhone) => {
  if (nUserId) {
    return fnAll(`
      SELECT userId, firstName, lastName, email, phone, preferredContact, createdAt, updatedAt
      FROM users
      WHERE userId = ?
      ORDER BY userId ASC
    `, [nUserId]);
  }

  if (cEmail) {
    return fnAll(`
      SELECT userId, firstName, lastName, email, phone, preferredContact, createdAt, updatedAt
      FROM users
      WHERE email = ?
      ORDER BY userId ASC
    `, [cEmail]);
  }

  if (cPhone) {
    return fnAll(`
      SELECT userId, firstName, lastName, email, phone, preferredContact, createdAt, updatedAt
      FROM users
      WHERE phone = ?
      ORDER BY userId ASC
    `, [cPhone]);
  }

  return fnAll(`
    SELECT userId, firstName, lastName, email, phone, preferredContact, createdAt, updatedAt
    FROM users
    ORDER BY userId ASC
  `);
};

const fnGetUserWithPasswordByEmail = async (cEmail) => {
  return fnAll(`
    SELECT *
    FROM users
    WHERE email = ?
    ORDER BY userId ASC
  `, [cEmail]);
};

const fnGetUserWithPasswordByPhone = async (cPhone) => {
  return fnAll(`
    SELECT *
    FROM users
    WHERE phone = ?
    ORDER BY userId ASC
  `, [cPhone]);
};

const fnCreateUser = async (cUser) => {
  const oResult = await fnRun(`
    INSERT INTO users (firstName, lastName, email, phone, preferredContact, passwordHash, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cUser.firstName,
    cUser.lastName,
    cUser.email,
    cUser.phone,
    cUser.preferredContact,
    cUser.passwordHash
  ]);

  return (await fnGetUsers(oResult.lastID))[0];
};

module.exports = {
  fnGetUsers,
  fnGetUserWithPasswordByEmail,
  fnGetUserWithPasswordByPhone,
  fnCreateUser
};
