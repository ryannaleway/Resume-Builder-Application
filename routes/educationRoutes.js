const express = require('express');
const { fnListEducationEntries, fnCreateEducationEntryHandler, fnUpdateEducationEntryHandler, fnDeleteEducationEntryHandler } = require('../controllers/educationController');

const cRouter = express.Router();

cRouter.get('/', fnListEducationEntries);
cRouter.post('/', fnCreateEducationEntryHandler);
cRouter.put('/:educationEntryId', fnUpdateEducationEntryHandler);
cRouter.delete('/:educationEntryId', fnDeleteEducationEntryHandler);

module.exports = cRouter;
