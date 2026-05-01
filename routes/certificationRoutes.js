const express = require('express');
const { fnListCertifications, fnCreateCertificationHandler, fnUpdateCertificationHandler, fnDeleteCertificationHandler } = require('../controllers/certificationController');

const cRouter = express.Router();

cRouter.get('/', fnListCertifications);
cRouter.post('/', fnCreateCertificationHandler);
cRouter.put('/:certificationId', fnUpdateCertificationHandler);
cRouter.delete('/:certificationId', fnDeleteCertificationHandler);

module.exports = cRouter;
