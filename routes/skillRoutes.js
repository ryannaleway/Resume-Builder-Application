const express = require('express');
const { fnListSkills, fnCreateSkillHandler, fnUpdateSkillHandler, fnDeleteSkillHandler } = require('../controllers/skillController');

const cRouter = express.Router();

cRouter.get('/', fnListSkills);
cRouter.post('/', fnCreateSkillHandler);
cRouter.put('/:skillId', fnUpdateSkillHandler);
cRouter.delete('/:skillId', fnDeleteSkillHandler);

module.exports = cRouter;
