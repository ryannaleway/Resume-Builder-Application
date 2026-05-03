const { fnRun, fnAll } = require('../db/database');

const fnGetCertifications = async (nCertificationId, nUserId) => {
  if (nCertificationId) {
    return fnAll(`
      SELECT *
      FROM certifications
      WHERE certificationId = ? AND userId = ?
      ORDER BY certificationName ASC
    `, [nCertificationId, nUserId]);
  }

  return fnAll(`
    SELECT *
    FROM certifications
    WHERE userId = ?
    ORDER BY certificationName ASC
  `, [nUserId]);
};

const fnCreateCertification = async (cCertification) => {
  const oResult = await fnRun(`
    INSERT INTO certifications (userId, certificationName, issuingOrganization, issuedDate, description, updatedAt)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cCertification.userId,
    cCertification.certificationName,
    cCertification.issuingOrganization,
    cCertification.issuedDate,
    cCertification.description
  ]);

  return (await fnGetCertifications(oResult.lastID, cCertification.userId))[0];
};

const fnUpdateCertification = async (nCertificationId, nUserId, cCertification) => {
  await fnRun(`
    UPDATE certifications
    SET certificationName = ?,
        issuingOrganization = ?,
        issuedDate = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE certificationId = ? AND userId = ?
  `, [
    cCertification.certificationName,
    cCertification.issuingOrganization,
    cCertification.issuedDate,
    cCertification.description,
    nCertificationId,
    nUserId
  ]);

  return (await fnGetCertifications(nCertificationId, nUserId))[0];
};

const fnDeleteCertification = (nCertificationId, nUserId) => {
  return fnRun('DELETE FROM certifications WHERE certificationId = ? AND userId = ?', [nCertificationId, nUserId]);
};

module.exports = {
  fnGetCertifications,
  fnCreateCertification,
  fnUpdateCertification,
  fnDeleteCertification
};
