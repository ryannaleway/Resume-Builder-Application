const { fnRun, fnAll } = require('../db/database');

const fnGetAwards = async (nAwardId, nUserId) => {
  if (nAwardId) {
    return fnAll(`
      SELECT *
      FROM awards
      WHERE awardId = ? AND userId = ?
      ORDER BY awardName ASC
    `, [nAwardId, nUserId]);
  }

  return fnAll(`
    SELECT *
    FROM awards
    WHERE userId = ?
    ORDER BY awardName ASC
  `, [nUserId]);
};

const fnCreateAward = async (cAward) => {
  const oResult = await fnRun(`
    INSERT INTO awards (userId, awardName, issuingOrganization, awardedDate, description, updatedAt)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cAward.userId,
    cAward.awardName,
    cAward.issuingOrganization,
    cAward.awardedDate,
    cAward.description
  ]);

  return (await fnGetAwards(oResult.lastID, cAward.userId))[0];
};

const fnUpdateAward = async (nAwardId, nUserId, cAward) => {
  await fnRun(`
    UPDATE awards
    SET awardName = ?,
        issuingOrganization = ?,
        awardedDate = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE awardId = ? AND userId = ?
  `, [
    cAward.awardName,
    cAward.issuingOrganization,
    cAward.awardedDate,
    cAward.description,
    nAwardId,
    nUserId
  ]);

  return (await fnGetAwards(nAwardId, nUserId))[0];
};

const fnDeleteAward = (nAwardId, nUserId) => {
  return fnRun('DELETE FROM awards WHERE awardId = ? AND userId = ?', [nAwardId, nUserId]);
};

module.exports = {
  fnGetAwards,
  fnCreateAward,
  fnUpdateAward,
  fnDeleteAward
};
