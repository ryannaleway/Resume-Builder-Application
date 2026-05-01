const { fnGetSkillCategories, fnCreateSkillCategory, fnUpdateSkillCategory, fnDeleteSkillCategory } = require('../models/skillCategoryModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListSkillCategories = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillCategoryId = cRequest.query.skillCategoryId ? fnRequirePositiveInteger(cRequest.query.skillCategoryId, 'skillCategoryId') : null;
  cResponse.status(200).json(await fnGetSkillCategories(nSkillCategoryId));
});

const fnCreateSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const cSkillCategory = await fnCreateSkillCategory({
    categoryName: fnRequireString(cRequest.body.categoryName, 'Category name')
  });

  cResponse.status(201).json(cSkillCategory);
});

const fnUpdateSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.params.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkillCategories(nSkillCategoryId))[0]) {
    throw fnCreateError(404, 'Skill category was not found.');
  }

  const cSkillCategory = await fnUpdateSkillCategory(nSkillCategoryId, {
    categoryName: fnRequireString(cRequest.body.categoryName, 'Category name')
  });

  cResponse.status(200).json(cSkillCategory);
});

const fnDeleteSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.params.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkillCategories(nSkillCategoryId))[0]) {
    throw fnCreateError(404, 'Skill category was not found.');
  }

  await fnDeleteSkillCategory(nSkillCategoryId);
  cResponse.status(200).json({ message: 'Skill category deleted successfully.' });
});

module.exports = {
  fnListSkillCategories,
  fnCreateSkillCategoryHandler,
  fnUpdateSkillCategoryHandler,
  fnDeleteSkillCategoryHandler
};
