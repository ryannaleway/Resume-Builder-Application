const express = require('express');
const { fnListResponsibilities, fnCreateResponsibilityHandler, fnUpdateResponsibilityHandler, fnDeleteResponsibilityHandler } = require('../controllers/responsibilityController');

const cRouter = express.Router();

cRouter.get('/', fnListResponsibilities);
cRouter.post('/', fnCreateResponsibilityHandler);
cRouter.put('/:responsibilityId', fnUpdateResponsibilityHandler);
cRouter.delete('/:responsibilityId', fnDeleteResponsibilityHandler);

module.exports = cRouter;
