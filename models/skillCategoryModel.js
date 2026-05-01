const { fnRun, fnAll } = require('../db/database');

const fnGetSkillCategories = async (nSkillCategoryId) => {
  if (nSkillCategoryId) {
    return fnAll(`
      SELECT *
      FROM skillCategories
      WHERE skillCategoryId = ?
      ORDER BY categoryName ASC
    `, [nSkillCategoryId]);
  }

  return fnAll(`
    SELECT *
    FROM skillCategories
    ORDER BY categoryName ASC
  `);
};

const fnCreateSkillCategory = async (cSkillCategory) => {
  const oResult = await fnRun(`
    INSERT INTO skillCategories (categoryName, updatedAt)
    VALUES (?, CURRENT_TIMESTAMP)
  `, [cSkillCategory.categoryName]);

  return (await fnGetSkillCategories(oResult.lastID))[0];
};

const fnUpdateSkillCategory = async (nSkillCategoryId, cSkillCategory) => {
  await fnRun(`
    UPDATE skillCategories
    SET categoryName = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE skillCategoryId = ?
  `, [
    cSkillCategory.categoryName,
    nSkillCategoryId
  ]);

  return (await fnGetSkillCategories(nSkillCategoryId))[0];
};

const fnDeleteSkillCategory = (nSkillCategoryId) => {
  return fnRun('DELETE FROM skillCategories WHERE skillCategoryId = ?', [nSkillCategoryId]);
};

module.exports = {
  fnGetSkillCategories,
  fnCreateSkillCategory,
  fnUpdateSkillCategory,
  fnDeleteSkillCategory
};
