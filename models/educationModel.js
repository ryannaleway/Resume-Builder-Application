const { fnRun, fnAll } = require('../db/database');

const fnGetEducationEntries = async (nEducationEntryId, nUserId) => {
  if (nEducationEntryId) {
    return fnAll(`
      SELECT *
      FROM educationEntries
      WHERE educationEntryId = ? AND userId = ?
      ORDER BY endDate DESC, graduationDate DESC, educationEntryId DESC
    `, [nEducationEntryId, nUserId]);
  }

  return fnAll(`
    SELECT *
    FROM educationEntries
    WHERE userId = ?
    ORDER BY endDate DESC, graduationDate DESC, educationEntryId DESC
  `, [nUserId]);
};

const fnCreateEducationEntry = async (cEducationEntry) => {
  const oResult = await fnRun(`
    INSERT INTO educationEntries (userId, schoolName, degreeName, majorName, startDate, endDate, graduationDate, location, notes, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cEducationEntry.userId,
    cEducationEntry.schoolName,
    cEducationEntry.degreeName,
    cEducationEntry.majorName,
    cEducationEntry.startDate,
    cEducationEntry.endDate,
    cEducationEntry.graduationDate,
    cEducationEntry.location,
    cEducationEntry.notes
  ]);

  return (await fnGetEducationEntries(oResult.lastID, cEducationEntry.userId))[0];
};

const fnUpdateEducationEntry = async (nEducationEntryId, nUserId, cEducationEntry) => {
  await fnRun(`
    UPDATE educationEntries
    SET schoolName = ?,
        degreeName = ?,
        majorName = ?,
        startDate = ?,
        endDate = ?,
        graduationDate = ?,
        location = ?,
        notes = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE educationEntryId = ? AND userId = ?
  `, [
    cEducationEntry.schoolName,
    cEducationEntry.degreeName,
    cEducationEntry.majorName,
    cEducationEntry.startDate,
    cEducationEntry.endDate,
    cEducationEntry.graduationDate,
    cEducationEntry.location,
    cEducationEntry.notes,
    nEducationEntryId,
    nUserId
  ]);

  return (await fnGetEducationEntries(nEducationEntryId, nUserId))[0];
};

const fnDeleteEducationEntry = (nEducationEntryId, nUserId) => {
  return fnRun('DELETE FROM educationEntries WHERE educationEntryId = ? AND userId = ?', [nEducationEntryId, nUserId]);
};

module.exports = {
  fnGetEducationEntries,
  fnCreateEducationEntry,
  fnUpdateEducationEntry,
  fnDeleteEducationEntry
};
