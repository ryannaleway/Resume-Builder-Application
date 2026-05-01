const { fnRun, fnAll } = require('../db/database');

const fnGetResponsibilities = async (nResponsibilityId, nJobId) => {
  if (nResponsibilityId) {
    return fnAll(`
      SELECT *
      FROM responsibilities
      WHERE responsibilityId = ?
      ORDER BY responsibilityId DESC
    `, [nResponsibilityId]);
  }

  if (nJobId) {
    return fnAll(`
      SELECT *
      FROM responsibilities
      WHERE jobId = ?
      ORDER BY responsibilityId ASC
    `, [nJobId]);
  }

  return fnAll(`
    SELECT *
    FROM responsibilities
    ORDER BY jobId ASC, responsibilityId ASC
  `);
};

const fnCreateResponsibility = async (cResponsibility) => {
  const oResult = await fnRun(`
    INSERT INTO responsibilities (jobId, description, updatedAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `, [
    cResponsibility.jobId,
    cResponsibility.description
  ]);

  return (await fnGetResponsibilities(oResult.lastID))[0];
};

const fnUpdateResponsibility = async (nResponsibilityId, cResponsibility) => {
  await fnRun(`
    UPDATE responsibilities
    SET jobId = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE responsibilityId = ?
  `, [
    cResponsibility.jobId,
    cResponsibility.description,
    nResponsibilityId
  ]);

  return (await fnGetResponsibilities(nResponsibilityId))[0];
};

const fnDeleteResponsibility = (nResponsibilityId) => {
  return fnRun('DELETE FROM responsibilities WHERE responsibilityId = ?', [nResponsibilityId]);
};

module.exports = {
  fnGetResponsibilities,
  fnCreateResponsibility,
  fnUpdateResponsibility,
  fnDeleteResponsibility
};
