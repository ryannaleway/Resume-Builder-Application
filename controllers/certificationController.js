const { fnGetCertifications, fnCreateCertification, fnUpdateCertification, fnDeleteCertification } = require('../models/certificationModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnOptionalString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListCertifications = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nCertificationId = cRequest.query.certificationId ? fnRequirePositiveInteger(cRequest.query.certificationId, 'certificationId') : null;
  cResponse.status(200).json(await fnGetCertifications(nCertificationId, nUserId));
});

const fnCreateCertificationHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cCertification = await fnCreateCertification({
    userId: nUserId,
    certificationName: fnRequireString(cRequest.body.certificationName, 'Certification name'),
    issuingOrganization: fnRequireString(cRequest.body.issuingOrganization, 'Issuing organization'),
    issuedDate: fnOptionalString(cRequest.body.issuedDate),
    description: fnOptionalString(cRequest.body.description)
  });

  cResponse.status(201).json(cCertification);
});

const fnUpdateCertificationHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const nCertificationId = fnRequirePositiveInteger(cRequest.params.certificationId, 'certificationId');

  if (!(await fnGetCertifications(nCertificationId, nUserId))[0]) {
    throw fnCreateError(404, 'Certification was not found.');
  }

  const cCertification = await fnUpdateCertification(nCertificationId, nUserId, {
    certificationName: fnRequireString(cRequest.body.certificationName, 'Certification name'),
    issuingOrganization: fnRequireString(cRequest.body.issuingOrganization, 'Issuing organization'),
    issuedDate: fnOptionalString(cRequest.body.issuedDate),
    description: fnOptionalString(cRequest.body.description)
  });

  cResponse.status(200).json(cCertification);
});

const fnDeleteCertificationHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nCertificationId = fnRequirePositiveInteger(cRequest.params.certificationId, 'certificationId');

  if (!(await fnGetCertifications(nCertificationId, nUserId))[0]) {
    throw fnCreateError(404, 'Certification was not found.');
  }

  await fnDeleteCertification(nCertificationId, nUserId);
  cResponse.status(200).json({ message: 'Certification deleted successfully.' });
});

module.exports = {
  fnListCertifications,
  fnCreateCertificationHandler,
  fnUpdateCertificationHandler,
  fnDeleteCertificationHandler
};
