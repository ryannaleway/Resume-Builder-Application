const express = require('express');
const { fnListJobs, fnCreateJobHandler, fnUpdateJobHandler, fnDeleteJobHandler } = require('../controllers/jobController');

const cRouter = express.Router();

cRouter.get('/', fnListJobs);
cRouter.post('/', fnCreateJobHandler);
cRouter.put('/:jobId', fnUpdateJobHandler);
cRouter.delete('/:jobId', fnDeleteJobHandler);

module.exports = cRouter;
