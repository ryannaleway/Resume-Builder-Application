const { fnRun, fnAll } = require('../db/database');

const fnGetJobs = async (nJobId, nUserId) => {
  if (nJobId) {
    return fnAll(`
      SELECT *
      FROM jobs
      WHERE jobId = ? AND userId = ?
      ORDER BY startDate DESC, jobId DESC
    `, [nJobId, nUserId]);
  }

  return fnAll(`
    SELECT *
    FROM jobs
    WHERE userId = ?
    ORDER BY startDate DESC, jobId DESC
  `, [nUserId]);
};

const fnCreateJob = async (cJob) => {
  const oResult = await fnRun(`
    INSERT INTO jobs (userId, title, company, startDate, endDate, location, summary, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cJob.userId,
    cJob.title,
    cJob.company,
    cJob.startDate,
    cJob.endDate,
    cJob.location,
    cJob.summary
  ]);

  return (await fnGetJobs(oResult.lastID, cJob.userId))[0];
};

const fnUpdateJob = async (nJobId, nUserId, cJob) => {
  await fnRun(`
    UPDATE jobs
    SET title = ?,
        company = ?,
        startDate = ?,
        endDate = ?,
        location = ?,
        summary = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE jobId = ? AND userId = ?
  `, [
    cJob.title,
    cJob.company,
    cJob.startDate,
    cJob.endDate,
    cJob.location,
    cJob.summary,
    nJobId,
    nUserId
  ]);

  return (await fnGetJobs(nJobId, nUserId))[0];
};

const fnDeleteJob = (nJobId, nUserId) => {
  return fnRun('DELETE FROM jobs WHERE jobId = ? AND userId = ?', [nJobId, nUserId]);
};

module.exports = {
  fnGetJobs,
  fnCreateJob,
  fnUpdateJob,
  fnDeleteJob
};
