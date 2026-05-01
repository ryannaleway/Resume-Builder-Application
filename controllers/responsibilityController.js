const { fnGetResponsibilities, fnCreateResponsibility, fnUpdateResponsibility, fnDeleteResponsibility } = require('../models/responsibilityModel');
const { fnGetJobs } = require('../models/jobModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListResponsibilities = fnAsyncHandler(async (cRequest, cResponse) => {
  const nResponsibilityId = cRequest.query.responsibilityId ? fnRequirePositiveInteger(cRequest.query.responsibilityId, 'responsibilityId') : null;
  const nJobId = cRequest.query.jobId ? fnRequirePositiveInteger(cRequest.query.jobId, 'jobId') : null;
  const aResponsibilities = await fnGetResponsibilities(nResponsibilityId, nJobId);

  cResponse.status(200).json(aResponsibilities);
});

const fnCreateResponsibilityHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nJobId = fnRequirePositiveInteger(cRequest.body.jobId, 'jobId');

  if (!(await fnGetJobs(nJobId))[0]) {
    throw fnCreateError(404, 'The selected job was not found.');
  }

  const cResponsibility = await fnCreateResponsibility({
    jobId: nJobId,
    description: fnRequireString(cRequest.body.description, 'Responsibility description')
  });

  cResponse.status(201).json(cResponsibility);
});

const fnUpdateResponsibilityHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nResponsibilityId = fnRequirePositiveInteger(cRequest.params.responsibilityId, 'responsibilityId');
  const nJobId = fnRequirePositiveInteger(cRequest.body.jobId, 'jobId');

  if (!(await fnGetResponsibilities(nResponsibilityId))[0]) {
    throw fnCreateError(404, 'Responsibility was not found.');
  }

  if (!(await fnGetJobs(nJobId))[0]) {
    throw fnCreateError(404, 'The selected job was not found.');
  }

  const cResponsibility = await fnUpdateResponsibility(nResponsibilityId, {
    jobId: nJobId,
    description: fnRequireString(cRequest.body.description, 'Responsibility description')
  });

  cResponse.status(200).json(cResponsibility);
});

const fnDeleteResponsibilityHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nResponsibilityId = fnRequirePositiveInteger(cRequest.params.responsibilityId, 'responsibilityId');

  if (!(await fnGetResponsibilities(nResponsibilityId))[0]) {
    throw fnCreateError(404, 'Responsibility was not found.');
  }

  await fnDeleteResponsibility(nResponsibilityId);
  cResponse.status(200).json({ message: 'Responsibility deleted successfully.' });
});

module.exports = {
  fnListResponsibilities,
  fnCreateResponsibilityHandler,
  fnUpdateResponsibilityHandler,
  fnDeleteResponsibilityHandler
};
