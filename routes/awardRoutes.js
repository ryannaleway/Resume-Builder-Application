const express = require('express');
const { fnListAwards, fnCreateAwardHandler, fnUpdateAwardHandler, fnDeleteAwardHandler } = require('../controllers/awardController');

const cRouter = express.Router();

cRouter.get('/', fnListAwards);
cRouter.post('/', fnCreateAwardHandler);
cRouter.put('/:awardId', fnUpdateAwardHandler);
cRouter.delete('/:awardId', fnDeleteAwardHandler);

module.exports = cRouter;
