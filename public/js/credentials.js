document.addEventListener('DOMContentLoaded', async () => {
  try {
    const aSettings = await fnApiRequest(`/api/settings?userId=${fnGetCurrentUserId()}`);
    const oGeminiSetting = aSettings.find((oItem) => oItem.settingKey === 'geminiApiKey');

    if (oGeminiSetting) {
      document.getElementById('savedKeyStatus').textContent = 'A Gemini API key is already stored securely.';
    }
  } catch (cError) {
    fnShowAlert('settingsAlert', cError.message, 'danger');
  }

  document.getElementById('settingsForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();

    try {
      await fnApiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          userId: fnGetCurrentUserId(),
          settingKey: 'geminiApiKey',
          settingValue: document.getElementById('geminiApiKey').value
        })
      });

      document.getElementById('settingsForm').reset();
      document.getElementById('savedKeyStatus').textContent = 'Your Gemini API key was saved securely.';
      fnShowAlert('settingsAlert', 'Gemini API key saved successfully.');
    } catch (cError) {
      fnShowAlert('settingsAlert', cError.message, 'danger');
    }
  });
});
