const express = require('express');
const { fnSuggestImprovements } = require('../controllers/aiController');

const cRouter = express.Router();

cRouter.post('/suggestions', fnSuggestImprovements);

module.exports = cRouter;
