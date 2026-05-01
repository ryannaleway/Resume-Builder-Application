const express = require('express');
const { fnGenerateResume } = require('../controllers/resumeController');

const cRouter = express.Router();

cRouter.get('/', fnGenerateResume);

module.exports = cRouter;
