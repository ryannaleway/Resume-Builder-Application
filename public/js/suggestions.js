let cSuggestionModalInstance = null;
let cSuggestionTargetFieldId = '';

const fnOpenSuggestionModal = async (cTargetFieldId, cSourceType) => {
  cSuggestionTargetFieldId = cTargetFieldId;
  const cField = document.getElementById(cTargetFieldId);
  const cSourceText = cField?.value?.trim() || '';

  if (!cSourceText) {
    fnShowAlert('globalAlert', 'Enter some text before requesting AI suggestions.', 'warning');
    return;
  }

  document.getElementById('suggestionsList').innerHTML = '<p class="mb-0">Loading AI suggestions...</p>';
  cSuggestionModalInstance.show();

  try {
    const oSuggestions = await fnApiRequest('/api/ai/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        sourceType: cSourceType,
        sourceText: cSourceText,
        apiKey: document.getElementById('inlineGeminiApiKey')?.value || ''
      })
    });

    document.getElementById('suggestionsList').innerHTML = (oSuggestions.suggestions || []).map((oSuggestion, nIndex) => {
      return `
        <article class="card suggestion-card border-0 bg-light mb-3">
          <div class="card-body">
            <h3 class="h6">Suggestion ${nIndex + 1}</h3>
            <p class="mb-2"><span class="fw-semibold">Original:</span> ${fnEscapeHtml(oSuggestion.originalText)}</p>
            <p class="mb-2"><span class="fw-semibold">Suggested:</span> ${fnEscapeHtml(oSuggestion.suggestedText)}</p>
            <p class="mb-3 text-body-secondary">${fnEscapeHtml(oSuggestion.reason)}</p>
            <button type="button" class="btn btn-success btn-sm" data-action="apply-suggestion" data-suggested-text="${fnEscapeHtml(oSuggestion.suggestedText)}">Apply Suggestion</button>
          </div>
        </article>
      `;
    }).join('');
  } catch (cError) {
    document.getElementById('suggestionsList').innerHTML = `<div class="alert alert-danger mb-0">${fnEscapeHtml(cError.message)}</div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const cSuggestionModalElement = document.getElementById('suggestionModal');

  if (!cSuggestionModalElement) {
    return;
  }

  cSuggestionModalInstance = new bootstrap.Modal(cSuggestionModalElement);

  document.getElementById('suggestionsList').addEventListener('click', (cEvent) => {
    const cButton = cEvent.target.closest('button[data-action="apply-suggestion"]');

    if (!cButton) {
      return;
    }

    const cTargetField = document.getElementById(cSuggestionTargetFieldId);

    if (cTargetField) {
      cTargetField.value = cButton.dataset.suggestedText;
    }

    cSuggestionModalInstance.hide();
  });
});
