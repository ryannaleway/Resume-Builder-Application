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
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      preferredContact TEXT NOT NULL DEFAULT 'email',
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      jobId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      location TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responsibilities (
      responsibilityId INTEGER PRIMARY KEY AUTOINCREMENT,
      jobId INTEGER NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jobId) REFERENCES jobs(jobId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS educationEntries (
      educationEntryId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      schoolName TEXT NOT NULL,
      degreeName TEXT DEFAULT '',
      majorName TEXT DEFAULT '',
      startDate TEXT DEFAULT '',
      endDate TEXT DEFAULT '',
      graduationDate TEXT DEFAULT '',
      location TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skillCategories (
      skillCategoryId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      categoryName TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
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
      userId INTEGER,
      certificationName TEXT NOT NULL,
      issuingOrganization TEXT NOT NULL,
      issuedDate TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS awards (
      awardId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      awardName TEXT NOT NULL,
      issuingOrganization TEXT NOT NULL,
      awardedDate TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
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
      userId INTEGER,
      settingKey TEXT PRIMARY KEY,
      settingValue TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );
  `);

  // Existing local databases may have been created before phone and preferred
  // contact support existed, so we inspect the schema and add the missing
  // columns without forcing the user to reset their data file.
  const aUserColumns = await fnAll('PRAGMA table_info(users)');
  const aUserColumnNames = aUserColumns.map((oColumn) => oColumn.name);

  if (!aUserColumnNames.includes('phone')) {
    await fnExec('ALTER TABLE users ADD COLUMN phone TEXT;');
  }

  if (!aUserColumnNames.includes('preferredContact')) {
    await fnExec(`ALTER TABLE users ADD COLUMN preferredContact TEXT NOT NULL DEFAULT 'email';`);
  }

  const aJobColumns = await fnAll('PRAGMA table_info(jobs)');
  if (!aJobColumns.map((oColumn) => oColumn.name).includes('userId')) {
    await fnExec('ALTER TABLE jobs ADD COLUMN userId INTEGER;');
  }

  const aSkillCategoryColumns = await fnAll('PRAGMA table_info(skillCategories)');
  if (!aSkillCategoryColumns.map((oColumn) => oColumn.name).includes('userId')) {
    await fnExec('ALTER TABLE skillCategories ADD COLUMN userId INTEGER;');
  }

  const aCertificationColumns = await fnAll('PRAGMA table_info(certifications)');
  if (!aCertificationColumns.map((oColumn) => oColumn.name).includes('userId')) {
    await fnExec('ALTER TABLE certifications ADD COLUMN userId INTEGER;');
  }

  const aAwardColumns = await fnAll('PRAGMA table_info(awards)');
  if (!aAwardColumns.map((oColumn) => oColumn.name).includes('userId')) {
    await fnExec('ALTER TABLE awards ADD COLUMN userId INTEGER;');
  }

  const aSettingColumns = await fnAll('PRAGMA table_info(settings)');
  if (!aSettingColumns.map((oColumn) => oColumn.name).includes('userId')) {
    await fnExec('ALTER TABLE settings ADD COLUMN userId INTEGER;');
  }

  const aEducationColumns = await fnAll('PRAGMA table_info(educationEntries)');
  if (aEducationColumns.length === 0) {
    await fnExec(`
      CREATE TABLE IF NOT EXISTS educationEntries (
        educationEntryId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        schoolName TEXT NOT NULL,
        degreeName TEXT DEFAULT '',
        majorName TEXT DEFAULT '',
        startDate TEXT DEFAULT '',
        endDate TEXT DEFAULT '',
        graduationDate TEXT DEFAULT '',
        location TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
      );
    `);
  }

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
