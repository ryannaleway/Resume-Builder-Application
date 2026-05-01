const { fnRun, fnAll } = require('../db/database');

const fnGetAwards = async (nAwardId) => {
  if (nAwardId) {
    return fnAll(`
      SELECT *
      FROM awards
      WHERE awardId = ?
      ORDER BY awardName ASC
    `, [nAwardId]);
  }

  return fnAll(`
    SELECT *
    FROM awards
    ORDER BY awardName ASC
  `);
};

const fnCreateAward = async (cAward) => {
  const oResult = await fnRun(`
    INSERT INTO awards (awardName, issuingOrganization, awardedDate, description, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cAward.awardName,
    cAward.issuingOrganization,
    cAward.awardedDate,
    cAward.description
  ]);

  return (await fnGetAwards(oResult.lastID))[0];
};

const fnUpdateAward = async (nAwardId, cAward) => {
  await fnRun(`
    UPDATE awards
    SET awardName = ?,
        issuingOrganization = ?,
        awardedDate = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE awardId = ?
  `, [
    cAward.awardName,
    cAward.issuingOrganization,
    cAward.awardedDate,
    cAward.description,
    nAwardId
  ]);

  return (await fnGetAwards(nAwardId))[0];
};

const fnDeleteAward = (nAwardId) => {
  return fnRun('DELETE FROM awards WHERE awardId = ?', [nAwardId]);
};

module.exports = {
  fnGetAwards,
  fnCreateAward,
  fnUpdateAward,
  fnDeleteAward
};
