const { fnRun, fnAll } = require('../db/database');

const fnBuildStoredSettingKey = (cSettingKey, nUserId) => `${nUserId}:${cSettingKey}`;

const fnGetSettings = async (cSettingKey, nUserId) => {
  if (cSettingKey) {
    return fnAll(`
      SELECT *
      FROM settings
      WHERE settingKey = ? AND userId = ?
      ORDER BY settingKey ASC
    `, [fnBuildStoredSettingKey(cSettingKey, nUserId), nUserId]);
  }

  return fnAll(`
    SELECT *
    FROM settings
    WHERE userId = ?
    ORDER BY settingKey ASC
  `, [nUserId]);
};

const fnUpsertSetting = async (cSettingKey, cSettingValue, nUserId) => {
  const cStoredSettingKey = fnBuildStoredSettingKey(cSettingKey, nUserId);
  await fnRun('DELETE FROM settings WHERE settingKey = ? AND userId = ?', [cStoredSettingKey, nUserId]);
  await fnRun(`
    INSERT INTO settings (userId, settingKey, settingValue, updatedAt)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `, [nUserId, cStoredSettingKey, cSettingValue]);

  return (await fnGetSettings(cSettingKey, nUserId))[0];
};

module.exports = {
  fnGetSettings,
  fnUpsertSetting
};
