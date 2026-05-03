const { fnRun, fnAll } = require('../db/database');

const fnDecodeSkillRecord = (oSkill, nUserId) => {
  if (!oSkill) {
    return oSkill;
  }

  return {
    ...oSkill,
    categoryName: String(oSkill.categoryName || '').replace(`|||uid:${nUserId}`, '')
  };
};

const fnGetSkills = async (nSkillId, nSkillCategoryId, nUserId) => {
  if (nSkillId) {
    const aRows = await fnAll(`
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE s.skillId = ? AND sc.userId = ?
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `, [nSkillId, nUserId]);

    return aRows.map((oSkill) => fnDecodeSkillRecord(oSkill, nUserId));
  }

  if (nSkillCategoryId) {
    const aRows = await fnAll(`
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE s.skillCategoryId = ? AND sc.userId = ?
      ORDER BY s.skillName ASC
    `, [nSkillCategoryId, nUserId]);

    return aRows.map((oSkill) => fnDecodeSkillRecord(oSkill, nUserId));
  }

  const aRows = await fnAll(`
    SELECT s.*, sc.categoryName
    FROM skills s
    INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
    WHERE sc.userId = ?
    ORDER BY sc.categoryName ASC, s.skillName ASC
  `, [nUserId]);

  return aRows.map((oSkill) => fnDecodeSkillRecord(oSkill, nUserId));
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

  return (await fnGetSkills(oResult.lastID, null, cSkill.userId))[0];
};

const fnUpdateSkill = async (nSkillId, nUserId, cSkill) => {
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

  return (await fnGetSkills(nSkillId, null, nUserId))[0];
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
