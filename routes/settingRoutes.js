const express = require('express');
const { fnListSettings, fnUpsertSettingHandler } = require('../controllers/settingController');

const cRouter = express.Router();

cRouter.get('/', fnListSettings);
cRouter.put('/', fnUpsertSettingHandler);

module.exports = cRouter;
