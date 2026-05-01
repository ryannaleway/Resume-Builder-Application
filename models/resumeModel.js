const { fnAll } = require('../db/database');

const fnBuildResumeData = async (cFilters) => {
  const aJobIds = cFilters.aJobIds;
  const aResponsibilityIds = cFilters.aResponsibilityIds;
  const aSkillIds = cFilters.aSkillIds;
  const aCertificationIds = cFilters.aCertificationIds;
  const aAwardIds = cFilters.aAwardIds;

  const cJobQuery = Array.isArray(aJobIds)
    ? `
      SELECT *
      FROM jobs
      WHERE ${aJobIds.length > 0 ? `jobId IN (${aJobIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY startDate DESC, jobId DESC
    `
    : `
      SELECT *
      FROM jobs
      ORDER BY startDate DESC, jobId DESC
    `;

  const aJobs = await fnAll(cJobQuery, aJobIds || []);

  const cResponsibilityQuery = Array.isArray(aResponsibilityIds)
    ? `
      SELECT *
      FROM responsibilities
      WHERE ${aResponsibilityIds.length > 0 ? `responsibilityId IN (${aResponsibilityIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY jobId ASC, responsibilityId ASC
    `
    : `
      SELECT *
      FROM responsibilities
      ORDER BY jobId ASC, responsibilityId ASC
    `;

  const aResponsibilities = await fnAll(cResponsibilityQuery, aResponsibilityIds || []);

  const cSkillQuery = Array.isArray(aSkillIds)
    ? `
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      WHERE ${aSkillIds.length > 0 ? `s.skillId IN (${aSkillIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `
    : `
      SELECT s.*, sc.categoryName
      FROM skills s
      INNER JOIN skillCategories sc ON sc.skillCategoryId = s.skillCategoryId
      ORDER BY sc.categoryName ASC, s.skillName ASC
    `;

  const aSkills = await fnAll(cSkillQuery, aSkillIds || []);

  const cCertificationQuery = Array.isArray(aCertificationIds)
    ? `
      SELECT *
      FROM certifications
      WHERE ${aCertificationIds.length > 0 ? `certificationId IN (${aCertificationIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY certificationName ASC
    `
    : `
      SELECT *
      FROM certifications
      ORDER BY certificationName ASC
    `;

  const aCertifications = await fnAll(cCertificationQuery, aCertificationIds || []);

  const cAwardQuery = Array.isArray(aAwardIds)
    ? `
      SELECT *
      FROM awards
      WHERE ${aAwardIds.length > 0 ? `awardId IN (${aAwardIds.map(() => '?').join(',')})` : '1 = 0'}
      ORDER BY awardName ASC
    `
    : `
      SELECT *
      FROM awards
      ORDER BY awardName ASC
    `;

  const aAwards = await fnAll(cAwardQuery, aAwardIds || []);
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

  const oSkillGroups = aSkills.reduce((oAccumulator, cSkill) => {
    if (!oAccumulator[cSkill.categoryName]) {
      oAccumulator[cSkill.categoryName] = [];
    }

    oAccumulator[cSkill.categoryName].push(cSkill);
    return oAccumulator;
  }, {});

  return [{
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
