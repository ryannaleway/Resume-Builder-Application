const { fnAsyncHandler } = require('../middleware/asyncMiddleware');
const { fnGetSettings } = require('../models/settingModel');
const { fnRequireString, fnRequirePositiveInteger, fnCreateError } = require('../utils/validation');
const { fnDecryptText } = require('../utils/security');

const fnSuggestImprovements = fnAsyncHandler(async (cRequest, cResponse) => {
  const nUserId = fnRequirePositiveInteger(cRequest.body.userId, 'userId');
  const cSourceType = fnRequireString(cRequest.body.sourceType, 'sourceType');
  const cSourceText = fnRequireString(cRequest.body.sourceText, 'sourceText');
  const cRequestApiKey = typeof cRequest.body.apiKey === 'string' ? cRequest.body.apiKey.trim() : '';
  const cStoredApiKeyRecord = (await fnGetSettings('geminiApiKey', nUserId))[0];
  const cStoredApiKey = cStoredApiKeyRecord ? fnDecryptText(cStoredApiKeyRecord.settingValue) : '';
  const cApiKey = cRequestApiKey || cStoredApiKey || process.env.GEMINI_API_KEY || '';

  if (!cApiKey) {
    throw fnCreateError(400, 'A Gemini API key is required before requesting suggestions.');
  }

  const cPrompt = [
    'You are assisting with resume writing.',
    `Content type: ${cSourceType}.`,
    'Return JSON with this exact shape:',
    '{"suggestions":[{"originalText":"string","suggestedText":"string","reason":"string"}]}',
    'Provide 2 to 4 concise suggestions that improve clarity, professionalism, and impact.',
    'If the text is already strong, still offer small refinements.',
    `Text: ${cSourceText}`
  ].join('\n');

  const cResponseFromGemini = await fetch(`${process.env.GEMINI_API_URL}?key=${encodeURIComponent(cApiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: cPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4
      }
    })
  });

  if (!cResponseFromGemini.ok) {
    const cErrorText = await cResponseFromGemini.text();
    throw fnCreateError(502, 'Gemini request failed.', [cErrorText]);
  }

  const cGeminiPayload = await cResponseFromGemini.json();
  const cModelText = cGeminiPayload?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  let oSuggestionPayload;

  try {
    oSuggestionPayload = JSON.parse(cModelText);
  } catch (cError) {
    oSuggestionPayload = {
      suggestions: [
        {
          originalText: cSourceText,
          suggestedText: cModelText.trim(),
          reason: 'Gemini returned plain text, so the application preserved it as a single suggestion.'
        }
      ]
    };
  }

  cResponse.status(200).json(oSuggestionPayload);
});

module.exports = {
  fnSuggestImprovements
};
