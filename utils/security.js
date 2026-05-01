const crypto = require('crypto');

const fnGetSecret = () => {
  return process.env.APP_SECRET || 'development-only-secret-change-me';
};

const fnEncryptText = (cPlainText) => {
  if (!cPlainText) {
    return '';
  }

  const cInitializationVector = crypto.randomBytes(16);
  const cKey = crypto.createHash('sha256').update(fnGetSecret()).digest();
  const cCipher = crypto.createCipheriv('aes-256-cbc', cKey, cInitializationVector);

  let cEncryptedText = cCipher.update(cPlainText, 'utf8', 'hex');
  cEncryptedText += cCipher.final('hex');

  return `${cInitializationVector.toString('hex')}:${cEncryptedText}`;
};

const fnDecryptText = (cEncryptedBundle) => {
  if (!cEncryptedBundle) {
    return '';
  }

  const [cInitializationVectorHex, cEncryptedText] = cEncryptedBundle.split(':');

  if (!cInitializationVectorHex || !cEncryptedText) {
    return '';
  }

  const cInitializationVector = Buffer.from(cInitializationVectorHex, 'hex');
  const cKey = crypto.createHash('sha256').update(fnGetSecret()).digest();
  const cDecipher = crypto.createDecipheriv('aes-256-cbc', cKey, cInitializationVector);

  let cDecryptedText = cDecipher.update(cEncryptedText, 'hex', 'utf8');
  cDecryptedText += cDecipher.final('utf8');

  return cDecryptedText;
};

module.exports = {
  fnEncryptText,
  fnDecryptText
};
