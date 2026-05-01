const { fnRun, fnAll } = require('../db/database');

const fnGetSkills = async (nSkillId, nSkillCategoryId) => {
  if (nSkillId) {
    return fnAll(`
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE s.skillId = ?
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `, [nSkillId]);
  }

  if (nSkillCategoryId) {
    return fnAll(`
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE s.skillCategoryId = ?
      ORDER BY s.skillName ASC
    `, [nSkillCategoryId]);
  }

  return fnAll(`
    SELECT s.*, sc.categoryName
    FROM skills s
    INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
    ORDER BY sc.categoryName ASC, s.skillName ASC
  `);
};

const fnCreateSkill = async (cSkill) => {
  const oResult = await fnRun(`
    INSERT INTO skills (skillCategoryId, skillName, proficiency, updatedAt)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    cSkill.skillCategoryId,
    cSkill.skillName,
    cSkill.proficiency
  ]);

  return (await fnGetSkills(oResult.lastID))[0];
};

const fnUpdateSkill = async (nSkillId, cSkill) => {
  await fnRun(`
    UPDATE skills
    SET skillCategoryId = ?,
        skillName = ?,
        proficiency = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE skillId = ?
  `, [
    cSkill.skillCategoryId,
    cSkill.skillName,
    cSkill.proficiency,
    nSkillId
  ]);

  return (await fnGetSkills(nSkillId))[0];
};

const fnDeleteSkill = (nSkillId) => {
  return fnRun('DELETE FROM skills WHERE skillId = ?', [nSkillId]);
};

module.exports = {
  fnGetSkills,
  fnCreateSkill,
  fnUpdateSkill,
  fnDeleteSkill
};
