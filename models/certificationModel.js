const { fnRun, fnAll } = require('../db/database');

const fnGetCertifications = async (nCertificationId) => {
  if (nCertificationId) {
    return fnAll(`
      SELECT *
      FROM certifications
      WHERE certificationId = ?
      ORDER BY certificationName ASC
    `, [nCertificationId]);
  }

  return fnAll(`
    SELECT *
    FROM certifications
    ORDER BY certificationName ASC
  `);
};

const fnCreateCertification = async (cCertification) => {
  const oResult = await fnRun(`
    INSERT INTO certifications (certificationName, issuingOrganization, issuedDate, description, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cCertification.certificationName,
    cCertification.issuingOrganization,
    cCertification.issuedDate,
    cCertification.description
  ]);

  return (await fnGetCertifications(oResult.lastID))[0];
};

const fnUpdateCertification = async (nCertificationId, cCertification) => {
  await fnRun(`
    UPDATE certifications
    SET certificationName = ?,
        issuingOrganization = ?,
        issuedDate = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE certificationId = ?
  `, [
    cCertification.certificationName,
    cCertification.issuingOrganization,
    cCertification.issuedDate,
    cCertification.description,
    nCertificationId
  ]);

  return (await fnGetCertifications(nCertificationId))[0];
};

const fnDeleteCertification = (nCertificationId) => {
  return fnRun('DELETE FROM certifications WHERE certificationId = ?', [nCertificationId]);
};

module.exports = {
  fnGetCertifications,
  fnCreateCertification,
  fnUpdateCertification,
  fnDeleteCertification
};
