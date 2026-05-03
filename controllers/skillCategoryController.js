const { fnGetSkillCategories, fnCreateSkillCategory, fnUpdateSkillCategory, fnDeleteSkillCategory } = require('../models/skillCategoryModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListSkillCategories = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nSkillCategoryId = cRequest.query.skillCategoryId ? fnRequirePositiveInteger(cRequest.query.skillCategoryId, 'skillCategoryId') : null;
  cResponse.status(200).json(await fnGetSkillCategories(nSkillCategoryId, nUserId));
});

const fnCreateSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cSkillCategory = await fnCreateSkillCategory({
    userId: nUserId,
    categoryName: fnRequireString(cRequest.body.categoryName, 'Category name')
  });

  cResponse.status(201).json(cSkillCategory);
});

const fnUpdateSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.params.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkillCategories(nSkillCategoryId, nUserId))[0]) {
    throw fnCreateError(404, 'Skill category was not found.');
  }

  const cSkillCategory = await fnUpdateSkillCategory(nSkillCategoryId, nUserId, {
    categoryName: fnRequireString(cRequest.body.categoryName, 'Category name')
  });

  cResponse.status(200).json(cSkillCategory);
});

const fnDeleteSkillCategoryHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.params.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkillCategories(nSkillCategoryId, nUserId))[0]) {
    throw fnCreateError(404, 'Skill category was not found.');
  }

  await fnDeleteSkillCategory(nSkillCategoryId, nUserId);
  cResponse.status(200).json({ message: 'Skill category deleted successfully.' });
});

module.exports = {
  fnListSkillCategories,
  fnCreateSkillCategoryHandler,
  fnUpdateSkillCategoryHandler,
  fnDeleteSkillCategoryHandler
};
