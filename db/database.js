const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const cDatabaseDirectory = path.join(__dirname);
const cDatabasePath = path.join(cDatabaseDirectory, 'resume-builder.sqlite');

if (!fs.existsSync(cDatabaseDirectory)) {
  fs.mkdirSync(cDatabaseDirectory, { recursive: true });
}

const cDatabase = new sqlite3.Database(cDatabasePath);

const fnRun = (cSql, aParameters = []) => {
  return new Promise((fResolve, fReject) => {
    cDatabase.run(cSql, aParameters, function(cError) {
      if (cError) {
        fReject(cError);
        return;
      }

      fResolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
};

const fnGet = (cSql, aParameters = []) => {
  return new Promise((fResolve, fReject) => {
    cDatabase.get(cSql, aParameters, (cError, oRow) => {
      if (cError) {
        fReject(cError);
        return;
      }

      fResolve(oRow);
    });
  });
};

const fnAll = (cSql, aParameters = []) => {
  return new Promise((fResolve, fReject) => {
    cDatabase.all(cSql, aParameters, (cError, aRows) => {
      if (cError) {
        fReject(cError);
        return;
      }

      fResolve(aRows);
    });
  });
};

const fnExec = (cSql) => {
  return new Promise((fResolve, fReject) => {
    cDatabase.exec(cSql, (cError) => {
      if (cError) {
        fReject(cError);
        return;
      }

      fResolve();
    });
  });
};

const fnInitializeDatabase = async () => {
  await fnExec('PRAGMA foreign_keys = ON;');

  await fnExec(`
    CREATE TABLE IF NOT EXISTS jobs (
      jobId INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      location TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responsibilities (
      responsibilityId INTEGER PRIMARY KEY AUTOINCREMENT,
      jobId INTEGER NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jobId) REFERENCES jobs(jobId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skillCategories (
      skillCategoryId INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryName TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      skillId INTEGER PRIMARY KEY AUTOINCREMENT,
      skillCategoryId INTEGER NOT NULL,
      skillName TEXT NOT NULL,
      proficiency TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (skillCategoryId) REFERENCES skillCategories(skillCategoryId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certifications (
      certificationId INTEGER PRIMARY KEY AUTOINCREMENT,
      certificationName TEXT NOT NULL,
      issuingOrganization TEXT NOT NULL,
      issuedDate TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS awards (
      awardId INTEGER PRIMARY KEY AUTOINCREMENT,
      awardName TEXT NOT NULL,
      issuingOrganization TEXT NOT NULL,
      awardedDate TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumeProfiles (
      resumeProfileId INTEGER PRIMARY KEY AUTOINCREMENT,
      resumeName TEXT NOT NULL,
      targetRole TEXT DEFAULT '',
      professionalSummary TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      settingKey TEXT PRIMARY KEY,
      settingValue TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const oJobCount = await fnGet('SELECT COUNT(*) AS nCount FROM jobs');

  if ((oJobCount?.nCount || 0) === 0) {
    await fnSeedSampleData();
  }
};

const fnSeedSampleData = async () => {
  await fnExec('BEGIN TRANSACTION;');

  try {
    const oJobOne = await fnRun(`
      INSERT INTO jobs (title, company, startDate, endDate, location, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Senior Full-Stack Developer',
      'Northwind Digital',
      '2022-02',
      'Present',
      'Chicago, IL',
      'Led delivery of customer-facing platforms with a focus on reliability, accessibility, and maintainable architecture.'
    ]);

    const oJobTwo = await fnRun(`
      INSERT INTO jobs (title, company, startDate, endDate, location, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Software Engineer',
      'Lakeshore Systems',
      '2019-06',
      '2022-01',
      'Remote',
      'Built internal tools and client solutions that reduced manual work and improved reporting accuracy.'
    ]);

    const aResponsibilityValues = [
      [oJobOne.lastID, 'Designed and shipped modular web application features used by operations and recruiting teams.'],
      [oJobOne.lastID, 'Improved application accessibility and print layouts to support polished client-ready documents.'],
      [oJobOne.lastID, 'Partnered with stakeholders to translate business goals into clear technical deliverables.'],
      [oJobTwo.lastID, 'Automated spreadsheet-driven workflows and reduced repetitive manual data entry.'],
      [oJobTwo.lastID, 'Built RESTful APIs and SQLite-backed utilities for reporting and document generation.']
    ];

    for (const aResponsibilityValue of aResponsibilityValues) {
      await fnRun(`
        INSERT INTO responsibilities (jobId, description)
        VALUES (?, ?)
      `, aResponsibilityValue);
    }

    const oCategoryOne = await fnRun(`
      INSERT INTO skillCategories (categoryName)
      VALUES (?)
    `, ['Programming Languages']);

    const oCategoryTwo = await fnRun(`
      INSERT INTO skillCategories (categoryName)
      VALUES (?)
    `, ['Frameworks & Tools']);

    const aSkillValues = [
      [oCategoryOne.lastID, 'JavaScript', 'Advanced'],
      [oCategoryOne.lastID, 'SQL', 'Advanced'],
      [oCategoryTwo.lastID, 'Node.js', 'Advanced'],
      [oCategoryTwo.lastID, 'Bootstrap 5', 'Advanced']
    ];

    for (const aSkillValue of aSkillValues) {
      await fnRun(`
        INSERT INTO skills (skillCategoryId, skillName, proficiency)
        VALUES (?, ?, ?)
      `, aSkillValue);
    }

    await fnRun(`
      INSERT INTO certifications (certificationName, issuingOrganization, issuedDate, description)
      VALUES (?, ?, ?, ?)
    `, [
      'Certified ScrumMaster',
      'Scrum Alliance',
      '2023-08',
      'Demonstrates applied agile delivery and cross-functional facilitation skills.'
    ]);

    await fnRun(`
      INSERT INTO awards (awardName, issuingOrganization, awardedDate, description)
      VALUES (?, ?, ?, ?)
    `, [
      'Operational Excellence Award',
      'Northwind Digital',
      '2024-11',
      'Recognized for building automation that improved document turnaround time.'
    ]);

    await fnRun(`
      INSERT INTO resumeProfiles (resumeName, targetRole, professionalSummary)
      VALUES (?, ?, ?)
    `, [
      'Default Resume',
      'Senior Software Engineer',
      'Full-stack engineer with experience building accessible web applications, internal tooling, and polished document workflows.'
    ]);

    await fnExec('COMMIT;');
  } catch (cError) {
    await fnExec('ROLLBACK;');
    throw cError;
  }
};

module.exports = {
  cDatabase,
  fnInitializeDatabase,
  fnRun,
  fnGet,
  fnAll,
  fnExec
};
