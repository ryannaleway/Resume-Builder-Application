const { fnRun, fnAll } = require('../db/database');

const fnGetUsers = async (nUserId, cEmail) => {
  if (nUserId) {
    return fnAll(`
      SELECT userId, firstName, lastName, email, createdAt, updatedAt
      FROM users
      WHERE userId = ?
      ORDER BY userId ASC
    `, [nUserId]);
  }

  if (cEmail) {
    return fnAll(`
      SELECT userId, firstName, lastName, email, createdAt, updatedAt
      FROM users
      WHERE email = ?
      ORDER BY userId ASC
    `, [cEmail]);
  }

  return fnAll(`
    SELECT userId, firstName, lastName, email, createdAt, updatedAt
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

const fnCreateUser = async (cUser) => {
  const oResult = await fnRun(`
    INSERT INTO users (firstName, lastName, email, passwordHash, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cUser.firstName,
    cUser.lastName,
    cUser.email,
    cUser.passwordHash
  ]);

  return (await fnGetUsers(oResult.lastID))[0];
};

module.exports = {
  fnGetUsers,
  fnGetUserWithPasswordByEmail,
  fnCreateUser
};
