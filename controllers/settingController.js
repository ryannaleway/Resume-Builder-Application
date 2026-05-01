const { fnGetSettings, fnUpsertSetting } = require('../models/settingModel');
const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnRequireString } = require('../utils/validation');
const { fnEncryptText } = require('../utils/security');

const fnListSettings = fnAsyncHandler(async (cRequest, cResponse) => {
  const cSettingKey = cRequest.query.settingKey ? fnRequireString(cRequest.query.settingKey, 'settingKey') : null;
  const aSettings = (await fnGetSettings(cSettingKey)).map((cSetting) => {
    return {
      settingKey: cSetting.settingKey,
      settingValue: cSetting.settingKey === 'geminiApiKey' ? 'Stored securely' : cSetting.settingValue
    };
  });

  cResponse.status(200).json(aSettings);
});

const fnUpsertSettingHandler = fnAsyncHandler(async (cRequest, cResponse) => {
  const cSettingKey = fnRequireString(cRequest.body.settingKey, 'settingKey');
  const cSettingValue = fnRequireString(cRequest.body.settingValue, 'settingValue');
  const cStoredValue = cSettingKey === 'geminiApiKey' ? fnEncryptText(cSettingValue) : cSettingValue;
  const cSetting = await fnUpsertSetting(cSettingKey, cStoredValue);

  cResponse.status(200).json({
    settingKey: cSetting.settingKey,
    settingValue: cSetting.settingKey === 'geminiApiKey' ? 'Stored securely' : cSetting.settingValue
  });
});

module.exports = {
  fnListSettings,
  fnUpsertSettingHandler
};
