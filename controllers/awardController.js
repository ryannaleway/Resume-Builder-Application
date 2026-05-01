const { fnGetAwards, fnCreateAward, fnUpdateAward, fnDeleteAward } = require('../models/awardModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnOptionalString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListAwards = fnAsyncHandler(async (cRequest, cResponse) => {
  const nAwardId = cRequest.query.awardId ? fnRequirePositiveInteger(cRequest.query.awardId, 'awardId') : null;
  cResponse.status(200).json(await fnGetAwards(nAwardId));
});

const fnCreateAwardHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const cAward = await fnCreateAward({
    awardName: fnRequireString(cRequest.body.awardName, 'Award name'),
    issuingOrganization: fnRequireString(cRequest.body.issuingOrganization, 'Issuing organization'),
    awardedDate: fnOptionalString(cRequest.body.awardedDate),
    description: fnOptionalString(cRequest.body.description)
  });

  cResponse.status(201).json(cAward);
});

const fnUpdateAwardHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nAwardId = fnRequirePositiveInteger(cRequest.params.awardId, 'awardId');

  if (!(await fnGetAwards(nAwardId))[0]) {
    throw fnCreateError(404, 'Award was not found.');
  }

  const cAward = await fnUpdateAward(nAwardId, {
    awardName: fnRequireString(cRequest.body.awardName, 'Award name'),
    issuingOrganization: fnRequireString(cRequest.body.issuingOrganization, 'Issuing organization'),
    awardedDate: fnOptionalString(cRequest.body.awardedDate),
    description: fnOptionalString(cRequest.body.description)
  });

  cResponse.status(200).json(cAward);
});

const fnDeleteAwardHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nAwardId = fnRequirePositiveInteger(cRequest.params.awardId, 'awardId');

  if (!(await fnGetAwards(nAwardId))[0]) {
    throw fnCreateError(404, 'Award was not found.');
  }

  await fnDeleteAward(nAwardId);
  cResponse.status(200).json({ message: 'Award deleted successfully.' });
});

module.exports = {
  fnListAwards,
  fnCreateAwardHandler,
  fnUpdateAwardHandler,
  fnDeleteAwardHandler
};
