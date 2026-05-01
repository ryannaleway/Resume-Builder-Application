const { fnRun, fnAll } = require('../db/database');

const fnGetJobs = async (nJobId) => {
  if (nJobId) {
    return fnAll(`
      SELECT *
      FROM jobs
      WHERE jobId = ?
      ORDER BY startDate DESC, jobId DESC
    `, [nJobId]);
  }

  return fnAll(`
    SELECT *
    FROM jobs
    ORDER BY startDate DESC, jobId DESC
  `);
};

const fnCreateJob = async (cJob) => {
  const oResult = await fnRun(`
    INSERT INTO jobs (title, company, startDate, endDate, location, summary, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cJob.title,
    cJob.company,
    cJob.startDate,
    cJob.endDate,
    cJob.location,
    cJob.summary
  ]);

  return (await fnGetJobs(oResult.lastID))[0];
};

const fnUpdateJob = async (nJobId, cJob) => {
  await fnRun(`
    UPDATE jobs
    SET title = ?,
        company = ?,
        startDate = ?,
        endDate = ?,
        location = ?,
        summary = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE jobId = ?
  `, [
    cJob.title,
    cJob.company,
    cJob.startDate,
    cJob.endDate,
    cJob.location,
    cJob.summary,
    nJobId
  ]);

  return (await fnGetJobs(nJobId))[0];
};

const fnDeleteJob = (nJobId) => {
  return fnRun('DELETE FROM jobs WHERE jobId = ?', [nJobId]);
};

module.exports = {
  fnGetJobs,
  fnCreateJob,
  fnUpdateJob,
  fnDeleteJob
};
