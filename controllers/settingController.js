const { fnGetSettings, fnUpsertSetting } = require('../models/settingModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString, fnRequirePositiveInteger } = require('../utils/validation');
const { fnEncryptText } = require('../utils/security');

const fnListSettings = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.query.userId, 'userId');
  const cSettingKey = cRequest.query.settingKey ? fnRequireString(cRequest.query.settingKey, 'settingKey') : null;
  const aSettings = (await fnGetSettings(cSettingKey, nUserId)).map((cSetting) => {
    const cCleanSettingKey = String(cSetting.settingKey).includes(':')
      ? String(cSetting.settingKey).split(':').slice(1).join(':')
      : cSetting.settingKey;

    return {
      settingKey: cCleanSettingKey,
      settingValue: cCleanSettingKey === 'geminiApiKey' ? 'Stored securely' : cSetting.settingValue
    };
  });

  cResponse.status(200).json(aSettings);
});

const fnUpsertSettingHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cSettingKey = fnRequireString(cRequest.body.settingKey, 'settingKey');
  const cSettingValue = fnRequireString(cRequest.body.settingValue, 'settingValue');
  const cStoredValue = cSettingKey === 'geminiApiKey' ? fnEncryptText(cSettingValue) : cSettingValue;
  const cSetting = await fnUpsertSetting(cSettingKey, cStoredValue, nUserId);

  cResponse.status(200).json({
    settingKey: cSettingKey,
    settingValue: cSettingKey === 'geminiApiKey' ? 'Stored securely' : cSetting.settingValue
  });
});

module.exports = {
  fnListSettings,
  fnUpsertSettingHandler
};
