const { fnRun, fnAll } = require('../db/database');

const fnGetSettings = async (cSettingKey) => {
  if (cSettingKey) {
    return fnAll(`
      SELECT *
      FROM settings
      WHERE settingKey = ?
      ORDER BY settingKey ASC
    `, [cSettingKey]);
  }

  return fnAll(`
    SELECT *
    FROM settings
    ORDER BY settingKey ASC
  `);
};

const fnUpsertSetting = async (cSettingKey, cSettingValue) => {
  await fnRun(`
    INSERT INTO settings (settingKey, settingValue, updatedAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(settingKey)
    DO UPDATE SET
      settingValue = excluded.settingValue,
      updatedAt = CURRENT_TIMESTAMP
  `, [cSettingKey, cSettingValue]);

  return (await fnGetSettings(cSettingKey))[0];
};

module.exports = {
  fnGetSettings,
  fnUpsertSetting
};
