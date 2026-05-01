const crypto = require('crypto');

const fnHashPassword = (cPassword) => {
  const cSalt = crypto.randomBytes(16).toString('hex');
  const cHash = crypto.pbkdf2Sync(cPassword, cSalt, 100000, 64, 'sha512').toString('hex');
  return `${cSalt}:${cHash}`;
};

const fnVerifyPassword = (cPassword, cStoredHash) => {
  if (!cStoredHash || !cStoredHash.includes(':')) {
    return false;
  }

  const [cSalt, cOriginalHash] = cStoredHash.split(':');
  const cComparisonHash = crypto.pbkdf2Sync(cPassword, cSalt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(cOriginalHash, 'hex'), Buffer.from(cComparisonHash, 'hex'));
};

module.exports = {
  fnHashPassword,
  fnVerifyPassword
};
