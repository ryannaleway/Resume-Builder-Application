const { fnAll } = require('../db/database');

const fnBuildResumeData = async (cFilters) => {
  const nUserId = cFilters.nUserId;
  const cContactMode = cFilters.cContactMode || 'email';
  const aJobIds = cFilters.aJobIds;
  const aResponsibilityIds = cFilters.aResponsibilityIds;
  const aSkillIds = cFilters.aSkillIds;
  const aCertificationIds = cFilters.aCertificationIds;
  const aAwardIds = cFilters.aAwardIds;

  const cJobQuery = Array.isArray(aJobIds)
    ? `
      SELECT *
      FROM jobs
      WHERE userId = ? AND ${aJobIds.length > 0 ? `jobId IN (${aJobIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY startDate DESC, jobId DESC
    `
    : `
      SELECT *
      FROM jobs
      WHERE userId = ?
      ORDER BY startDate DESC, jobId DESC
    `;

  const aJobs = await fnAll(cJobQuery, [nUserId, ...(aJobIds || [])]);

  const cResponsibilityQuery = Array.isArray(aResponsibilityIds)
    ? `
      SELECT r.*
      FROM responsibilities r
      INNER JOIN jobs j ON j.jobId = r.jobId
      WHERE j.userId = ? AND ${aResponsibilityIds.length > 0 ? `r.responsibilityId IN (${aResponsibilityIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY r.jobId ASC, r.responsibilityId ASC
    `
    : `
      SELECT r.*
      FROM responsibilities r
      INNER JOIN jobs j ON j.jobId = r.jobId
      WHERE j.userId = ?
      ORDER BY r.jobId ASC, r.responsibilityId ASC
    `;

  const aResponsibilities = await fnAll(cResponsibilityQuery, [nUserId, ...(aResponsibilityIds || [])]);

  const cSkillQuery = Array.isArray(aSkillIds)
    ? `
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE sc.userId = ? AND ${aSkillIds.length > 0 ? `s.skillId IN (${aSkillIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `
    : `
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE sc.userId = ?
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `;

  const aSkills = await fnAll(cSkillQuery, [nUserId, ...(aSkillIds || [])]);
  const aDecodedSkills = aSkills.map((cSkill) => {
    return {
      ...cSkill,
      categoryName: String(cSkill.categoryName || '').replace(`|||uid:${nUserId}`, '')
    };
  });

  const cCertificationQuery = Array.isArray(aCertificationIds)
    ? `
      SELECT *
      FROM certifications
      WHERE userId = ? AND ${aCertificationIds.length > 0 ? `certificationId IN (${aCertificationIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY certificationName ASC
    `
    : `
      SELECT *
      FROM certifications
      WHERE userId = ?
      ORDER BY certificationName ASC
    `;

  const aCertifications = await fnAll(cCertificationQuery, [nUserId, ...(aCertificationIds || [])]);

  const cAwardQuery = Array.isArray(aAwardIds)
    ? `
      SELECT *
      FROM awards
      WHERE userId = ? AND ${aAwardIds.length > 0 ? `awardId IN (${aAwardIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY awardName ASC
    `
    : `
      SELECT *
      FROM awards
      WHERE userId = ?
      ORDER BY awardName ASC
    `;

  const aAwards = await fnAll(cAwardQuery, [nUserId, ...(aAwardIds || [])]);
  const aResumeProfiles = await fnAll(`
    SELECT *
    FROM resumeProfiles
    ORDER BY resumeProfileId ASC
  `);

  const aJobsWithResponsibilities = aJobs.map((cJob) => {
    return {
      ...cJob,
      responsibilities: aResponsibilities.filter((cResponsibility) => cResponsibility.jobId === cJob.jobId)
    };
  });

  const oSkillGroups = aDecodedSkills.reduce((oAccumulator, cSkill) => {
    if (!oAccumulator[cSkill.categoryName]) {
      oAccumulator[cSkill.categoryName] = [];
    }

    oAccumulator[cSkill.categoryName].push(cSkill);
    return oAccumulator;
  }, {});

  const aUsers = nUserId ? await fnAll(`
    SELECT userId, firstName, lastName, email, phone
    FROM users
    WHERE userId = ?
  `, [nUserId]) : [];

  return [{
    user: aUsers[0] || null,
    contactMode: cContactMode,
    profile: aResumeProfiles[0] || null,
    jobs: aJobsWithResponsibilities,
    skillsByCategory: oSkillGroups,
    certifications: aCertifications,
    awards: aAwards
  }];
};

module.exports = {
  fnBuildResumeData
};
