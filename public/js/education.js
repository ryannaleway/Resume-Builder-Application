const oEducationPageState = {
  nEditingEducationEntryId: null
};

const fnLoadEducationPage = async () => {
  const aEducationEntries = await fnApiRequest(`/api/education?userId=${fnGetCurrentUserId()}`);
  oAppState.aEducationEntries = aEducationEntries;

  document.getElementById('educationList').innerHTML = aEducationEntries.map((oEducationEntry) => {
    const cProgramLine = [oEducationEntry.degreeName, oEducationEntry.majorName].filter(Boolean).join(' in ');
    const cTimelineLine = [fnFormatMonth(oEducationEntry.startDate), fnFormatMonth(oEducationEntry.endDate || oEducationEntry.graduationDate)].filter(Boolean).join(' - ');

    return `
      <article class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 class="h4 mb-1">${fnEscapeHtml(oEducationEntry.schoolName)}</h2>
              ${cProgramLine ? `<p class="mb-1 fw-semibold">${fnEscapeHtml(cProgramLine)}</p>` : ''}
              ${oEducationEntry.location ? `<p class="mb-1 text-body-secondary">${fnEscapeHtml(oEducationEntry.location)}</p>` : ''}
              ${cTimelineLine ? `<p class="mb-2 text-body-secondary">${fnEscapeHtml(cTimelineLine)}</p>` : ''}
              ${oEducationEntry.notes ? `<p class="mb-0">${fnEscapeHtml(oEducationEntry.notes)}</p>` : ''}
            </div>
            <div class="btn-group" role="group" aria-label="Education actions">
              <button type="button" class="btn btn-outline-secondary" data-action="edit-education" data-education-entry-id="${oEducationEntry.educationEntryId}">Edit</button>
              <button type="button" class="btn btn-outline-danger" data-action="delete-education" data-education-entry-id="${oEducationEntry.educationEntryId}">Delete</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

document.addEventListener('DOMContentLoaded', async () => {
  await fnLoadEducationPage();

  document.getElementById('educationForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    const oPayload = {
      userId: fnGetCurrentUserId(),
      schoolName: document.getElementById('schoolName').value,
      degreeName: document.getElementById('degreeName').value,
      majorName: document.getElementById('majorName').value,
      startDate: document.getElementById('educationStartDate').value,
      endDate: document.getElementById('educationEndDate').value,
      graduationDate: document.getElementById('graduationDate').value,
      location: document.getElementById('educationLocation').value,
      notes: document.getElementById('educationNotes').value
    };

    try {
      if (oEducationPageState.nEditingEducationEntryId) {
        await fnApiRequest(`/api/education/${oEducationPageState.nEditingEducationEntryId}`, {
          method: 'PUT',
          body: JSON.stringify(oPayload)
        });
      } else {
        await fnApiRequest('/api/education', {
          method: 'POST',
          body: JSON.stringify(oPayload)
        });
      }

      cEvent.target.reset();
      oEducationPageState.nEditingEducationEntryId = null;
      document.getElementById('educationSubmitButton').textContent = 'Save Education';
      fnShowAlert('educationAlert', 'Education entry saved successfully.');
      await fnLoadEducationPage();
    } catch (cError) {
      fnShowAlert('educationAlert', cError.message, 'danger');
    }
  });

  document.getElementById('educationList').addEventListener('click', async (cEvent) => {
    const cButton = cEvent.target.closest('button');

    if (!cButton) {
      return;
    }

    const cAction = cButton.dataset.action;

    if (cAction === 'edit-education') {
      const oEducationEntry = oAppState.aEducationEntries.find((oItem) => oItem.educationEntryId === Number(cButton.dataset.educationEntryId));
      oEducationPageState.nEditingEducationEntryId = oEducationEntry.educationEntryId;
      document.getElementById('schoolName').value = oEducationEntry.schoolName;
      document.getElementById('degreeName').value = oEducationEntry.degreeName || '';
      document.getElementById('majorName').value = oEducationEntry.majorName || '';
      document.getElementById('educationStartDate').value = oEducationEntry.startDate || '';
      document.getElementById('educationEndDate').value = oEducationEntry.endDate || '';
      document.getElementById('graduationDate').value = oEducationEntry.graduationDate || '';
      document.getElementById('educationLocation').value = oEducationEntry.location || '';
      document.getElementById('educationNotes').value = oEducationEntry.notes || '';
      document.getElementById('educationSubmitButton').textContent = 'Update Education';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (cAction === 'delete-education') {
      await fnApiRequest(`/api/education/${Number(cButton.dataset.educationEntryId)}?userId=${fnGetCurrentUserId()}`, {
        method: 'DELETE'
      });
      fnShowAlert('educationAlert', 'Education entry deleted successfully.');
      await fnLoadEducationPage();
    }
  });
});
