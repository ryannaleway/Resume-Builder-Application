const { fnGetSkills, fnCreateSkill, fnUpdateSkill, fnDeleteSkill } = require('../models/skillModel');
const { fnGetSkillCategories } = require('../models/skillCategoryModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnOptionalString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');

const fnListSkills = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillId = cRequest.query.skillId ? fnRequirePositiveInteger(cRequest.query.skillId, 'skillId') : null;
  const nSkillCategoryId = cRequest.query.skillCategoryId ? fnRequirePositiveInteger(cRequest.query.skillCategoryId, 'skillCategoryId') : null;

  cResponse.status(200).json(await fnGetSkills(nSkillId, nSkillCategoryId));
});

const fnCreateSkillHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.body.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkillCategories(nSkillCategoryId))[0]) {
    throw fnCreateError(404, 'The selected skill category was not found.');
  }

  const cSkill = await fnCreateSkill({
    skillCategoryId: nSkillCategoryId,
    skillName: fnRequireString(cRequest.body.skillName, 'Skill name'),
    proficiency: fnOptionalString(cRequest.body.proficiency)
  });

  cResponse.status(201).json(cSkill);
});

const fnUpdateSkillHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillId = fnRequirePositiveInteger(cRequest.params.skillId, 'skillId');
  const nSkillCategoryId = fnRequirePositiveInteger(cRequest.body.skillCategoryId, 'skillCategoryId');

  if (!(await fnGetSkills(nSkillId))[0]) {
    throw fnCreateError(404, 'Skill was not found.');
  }

  if (!(await fnGetSkillCategories(nSkillCategoryId))[0]) {
    throw fnCreateError(404, 'The selected skill category was not found.');
  }

  const cSkill = await fnUpdateSkill(nSkillId, {
    skillCategoryId: nSkillCategoryId,
    skillName: fnRequireString(cRequest.body.skillName, 'Skill name'),
    proficiency: fnOptionalString(cRequest.body.proficiency)
  });

  cResponse.status(200).json(cSkill);
});

const fnDeleteSkillHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nSkillId = fnRequirePositiveInteger(cRequest.params.skillId, 'skillId');

  if (!(await fnGetSkills(nSkillId))[0]) {
    throw fnCreateError(404, 'Skill was not found.');
  }

  await fnDeleteSkill(nSkillId);
  cResponse.status(200).json({ message: 'Skill deleted successfully.' });
});

module.exports = {
  fnListSkills,
  fnCreateSkillHandler,
  fnUpdateSkillHandler,
  fnDeleteSkillHandler
};
