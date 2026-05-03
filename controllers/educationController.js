const { fnGetEducationEntries, fnCreateEducationEntry, fnUpdateEducationEntry, fnDeleteEducationEntry } = require('../models/educationModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnOptionalString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListEducationEntries = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nEducationEntryId = cRequest.query.educationEntryId ? fnRequirePositiveInteger(cRequest.query.educationEntryId, 'educationEntryId') : null;
  cResponse.status(200).json(await fnGetEducationEntries(nEducationEntryId, nUserId));
});

const fnCreateEducationEntryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cEducationEntry = await fnCreateEducationEntry({
    userId: nUserId,
    schoolName: fnRequireString(cRequest.body.schoolName, 'School name'),
    degreeName: fnOptionalString(cRequest.body.degreeName),
    majorName: fnOptionalString(cRequest.body.majorName),
    startDate: fnOptionalString(cRequest.body.startDate),
    endDate: fnOptionalString(cRequest.body.endDate),
    graduationDate: fnOptionalString(cRequest.body.graduationDate),
    location: fnOptionalString(cRequest.body.location),
    notes: fnOptionalString(cRequest.body.notes)
  });

  cResponse.status(201).json(cEducationEntry);
});

const fnUpdateEducationEntryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const nEducationEntryId = fnRequirePositiveInteger(cRequest.params.educationEntryId, 'educationEntryId');

  if (!(await fnGetEducationEntries(nEducationEntryId, nUserId))[0]) {
    throw fnCreateError(404, 'Education entry was not found.');
  }

  const cEducationEntry = await fnUpdateEducationEntry(nEducationEntryId, nUserId, {
    schoolName: fnRequireString(cRequest.body.schoolName, 'School name'),
    degreeName: fnOptionalString(cRequest.body.degreeName),
    majorName: fnOptionalString(cRequest.body.majorName),
    startDate: fnOptionalString(cRequest.body.startDate),
    endDate: fnOptionalString(cRequest.body.endDate),
    graduationDate: fnOptionalString(cRequest.body.graduationDate),
    location: fnOptionalString(cRequest.body.location),
    notes: fnOptionalString(cRequest.body.notes)
  });

  cResponse.status(200).json(cEducationEntry);
});

const fnDeleteEducationEntryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nEducationEntryId = fnRequirePositiveInteger(cRequest.params.educationEntryId, 'educationEntryId');

  if (!(await fnGetEducationEntries(nEducationEntryId, nUserId))[0]) {
    throw fnCreateError(404, 'Education entry was not found.');
  }

  await fnDeleteEducationEntry(nEducationEntryId, nUserId);
  cResponse.status(200).json({ message: 'Education entry deleted successfully.' });
});

module.exports = {
  fnListEducationEntries,
  fnCreateEducationEntryHandler,
  fnUpdateEducationEntryHandler,
  fnDeleteEducationEntryHandler
};
