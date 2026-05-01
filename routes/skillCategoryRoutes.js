const express = require('express');
const { fnListSkillCategories, fnCreateSkillCategoryHandler, fnUpdateSkillCategoryHandler, fnDeleteSkillCategoryHandler } = require('../controllers/skillCategoryController');

const cRouter = express.Router();

cRouter.get('/', fnListSkillCategories);
cRouter.post('/', fnCreateSkillCategoryHandler);
cRouter.put('/:skillCategoryId', fnUpdateSkillCategoryHandler);
cRouter.delete('/:skillCategoryId', fnDeleteSkillCategoryHandler);

module.exports = cRouter;
