const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnBuildResumeData } = require('../models/resumeModel');
const { fnParseIdArray } = require('../utils/validation');

const fnParseSelectionIds = (vValue) => {
  if (typeof vValue === 'undefined') {
    return null;
  }

  return fnParseIdArray(vValue);
};

const fnGenerateResume = fnAsyncHandler(async (cRequest, cResponse) => {
  const aResume = await fnBuildResumeData({
    aJobIds: fnParseSelectionIds(cRequest.query.jobIds),
    aResponsibilityIds: fnParseSelectionIds(cRequest.query.responsibilityIds),
    aSkillIds: fnParseSelectionIds(cRequest.query.skillIds),
    aCertificationIds: fnParseSelectionIds(cRequest.query.certificationIds),
    aAwardIds: fnParseSelectionIds(cRequest.query.awardIds)
  });

  cResponse.status(200).json(aResume);
});

module.exports = {
  fnGenerateResume
};
