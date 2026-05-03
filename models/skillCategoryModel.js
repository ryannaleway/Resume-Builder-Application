const { fnRun, fnAll } = require('../db/database');

const fnEncodeCategoryName = (cCategoryName, nUserId) => `${cCategoryName}|||uid:${nUserId}`;
const fnDecodeCategoryRecord = (oCategory, nUserId) => {
  if (!oCategory) {
    return oCategory;
  }

  return {
    ...oCategory,
    categoryName: String(oCategory.categoryName || '').replace(`|||uid:${nUserId}`, '')
  };
};

const fnGetSkillCategories = async (nSkillCategoryId, nUserId) => {
  if (nSkillCategoryId) {
    const aRows = await fnAll(`
      SELECT *
      FROM skillCategories
      WHERE skillCategoryId = ? AND userId = ?
      ORDER BY categoryName ASC
    `, [nSkillCategoryId, nUserId]);

    return aRows.map((oCategory) => fnDecodeCategoryRecord(oCategory, nUserId));
  }

  const aRows = await fnAll(`
    SELECT *
    FROM skillCategories
    WHERE userId = ?
    ORDER BY categoryName ASC
  `, [nUserId]);

  return aRows.map((oCategory) => fnDecodeCategoryRecord(oCategory, nUserId));
};

const fnCreateSkillCategory = async (cSkillCategory) => {
  const oResult = await fnRun(`
    INSERT INTO skillCategories (userId, categoryName, updatedAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `, [cSkillCategory.userId, fnEncodeCategoryName(cSkillCategory.categoryName, cSkillCategory.userId)]);

  return (await fnGetSkillCategories(oResult.lastID, cSkillCategory.userId))[0];
};

const fnUpdateSkillCategory = async (nSkillCategoryId, nUserId, cSkillCategory) => {
  await fnRun(`
    UPDATE skillCategories
    SET categoryName = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE skillCategoryId = ? AND userId = ?
  `, [
    fnEncodeCategoryName(cSkillCategory.categoryName, nUserId),
    nSkillCategoryId,
    nUserId
  ]);

  return (await fnGetSkillCategories(nSkillCategoryId, nUserId))[0];
};

const fnDeleteSkillCategory = (nSkillCategoryId, nUserId) => {
  return fnRun('DELETE FROM skillCategories WHERE skillCategoryId = ? AND userId = ?', [nSkillCategoryId, nUserId]);
};

module.exports = {
  fnGetSkillCategories,
  fnCreateSkillCategory,
  fnUpdateSkillCategory,
  fnDeleteSkillCategory
};
