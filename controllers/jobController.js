const { fnGetJobs, fnCreateJob, fnUpdateJob, fnDeleteJob } = require('../models/jobModel');
const { fnGetResponsibilities } = require('../models/responsibilityModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnOptionalString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListJobs = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nJobId = cRequest.query.jobId ? fnRequirePositiveInteger(cRequest.query.jobId, 'jobId') : null;
  const aSourceJobs = await fnGetJobs(nJobId, nUserId);
  const aJobs = await Promise.all(aSourceJobs.map(async (cJob) => {
    return {
      ...cJob,
      responsibilities: await fnGetResponsibilities(null, cJob.jobId)
    };
  }));

  cResponse.status(200).json(aJobs);
});

const fnCreateJobHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cJob = await fnCreateJob({
    userId: nUserId,
    title: fnRequireString(cRequest.body.title, 'Title'),
    company: fnRequireString(cRequest.body.company, 'Company'),
    startDate: fnRequireString(cRequest.body.startDate, 'Start date'),
    endDate: fnRequireString(cRequest.body.endDate, 'End date'),
    location: fnOptionalString(cRequest.body.location),
    summary: fnOptionalString(cRequest.body.summary)
  });

  cResponse.status(201).json(cJob);
});

const fnUpdateJobHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const nJobId = fnRequirePositiveInteger(cRequest.params.jobId, 'jobId');
  const cExistingJob = (await fnGetJobs(nJobId, nUserId))[0];

  if (!cExistingJob) {
    throw fnCreateError(404, 'Job was not found.');
  }

  const cJob = await fnUpdateJob(nJobId, nUserId, {
    title: fnRequireString(cRequest.body.title, 'Title'),
    company: fnRequireString(cRequest.body.company, 'Company'),
    startDate: fnRequireString(cRequest.body.startDate, 'Start date'),
    endDate: fnRequireString(cRequest.body.endDate, 'End date'),
    location: fnOptionalString(cRequest.body.location),
    summary: fnOptionalString(cRequest.body.summary)
  });

  cResponse.status(200).json(cJob);
});

const fnDeleteJobHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nJobId = fnRequirePositiveInteger(cRequest.params.jobId, 'jobId');
  const cExistingJob = (await fnGetJobs(nJobId, nUserId))[0];

  if (!cExistingJob) {
    throw fnCreateError(404, 'Job was not found.');
  }

  await fnDeleteJob(nJobId, nUserId);
  cResponse.status(200).json({ message: 'Job deleted successfully.' });
});

module.exports = {
  fnListJobs,
  fnCreateJobHandler,
  fnUpdateJobHandler,
  fnDeleteJobHandler
};
