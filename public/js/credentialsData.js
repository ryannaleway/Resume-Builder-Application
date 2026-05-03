const oCredentialsPageState = {
  nEditingCertificationId: null,
  nEditingAwardId: null
};

const fnLoadCredentialsPage = async () => {
  const nUserId = fnGetCurrentUserId();
  const [aCertifications, aAwards] = await Promise.all([
    fnApiRequest(`/api/certifications?userId=${nUserId}`),
    fnApiRequest(`/api/awards?userId=${nUserId}`)
  ]);

  oAppState.aCertifications = aCertifications;
  oAppState.aAwards = aAwards;

  document.getElementById('certificationList').innerHTML = aCertifications.map((oCertification) => {
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
        <div>
          <p class="fw-semibold mb-1">${fnEscapeHtml(oCertification.certificationName)}</p>
          <p class="mb-0 text-body-secondary">${fnEscapeHtml(oCertification.issuingOrganization)}</p>
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Certification actions">
          <button type="button" class="btn btn-outline-secondary" data-action="edit-certification" data-certification-id="${oCertification.certificationId}">Edit</button>
          <button type="button" class="btn btn-outline-danger" data-action="delete-certification" data-certification-id="${oCertification.certificationId}">Delete</button>
        </div>
      </li>
    `;
  }).join('');

  document.getElementById('awardList').innerHTML = aAwards.map((oAward) => {
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
        <div>
          <p class="fw-semibold mb-1">${fnEscapeHtml(oAward.awardName)}</p>
          <p class="mb-0 text-body-secondary">${fnEscapeHtml(oAward.issuingOrganization)}</p>
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Award actions">
          <button type="button" class="btn btn-outline-secondary" data-action="edit-award" data-award-id="${oAward.awardId}">Edit</button>
          <button type="button" class="btn btn-outline-danger" data-action="delete-award" data-award-id="${oAward.awardId}">Delete</button>
        </div>
      </li>
    `;
  }).join('');
};

window.fnInitializeCredentialsView = async () => {
  window.fnInitializeSuggestionModal();
  await window.fnInitializeCredentialsSettingsView();

  if (!window.fnHasViewBeenInitialized('/credentials')) {
    document.getElementById('certificationSuggestionButton').addEventListener('click', async () => {
      await fnOpenSuggestionModal('certificationDescription', 'certification');
    });

    document.getElementById('certificationForm').addEventListener('submit', async (cEvent) => {
      cEvent.preventDefault();
      const oPayload = {
        userId: fnGetCurrentUserId(),
        certificationName: document.getElementById('certificationName').value,
        issuingOrganization: document.getElementById('certificationOrganization').value,
        issuedDate: document.getElementById('certificationDate').value,
        description: document.getElementById('certificationDescription').value
      };

      try {
        if (oCredentialsPageState.nEditingCertificationId) {
          await fnApiRequest(`/api/certifications/${oCredentialsPageState.nEditingCertificationId}`, {
            method: 'PUT',
            body: JSON.stringify(oPayload)
          });
        } else {
          await fnApiRequest('/api/certifications', {
            method: 'POST',
            body: JSON.stringify(oPayload)
          });
        }

        cEvent.target.reset();
        oCredentialsPageState.nEditingCertificationId = null;
        document.getElementById('certificationSubmitButton').textContent = 'Save Certification';
        fnShowAlert('credentialsAlert', 'Certification saved successfully.');
        await fnLoadCredentialsPage();
      } catch (cError) {
        fnShowAlert('credentialsAlert', cError.message, 'danger');
      }
    });

    document.getElementById('awardForm').addEventListener('submit', async (cEvent) => {
      cEvent.preventDefault();
      const oPayload = {
        userId: fnGetCurrentUserId(),
        awardName: document.getElementById('awardName').value,
        issuingOrganization: document.getElementById('awardOrganization').value,
        awardedDate: document.getElementById('awardDate').value,
        description: document.getElementById('awardDescription').value
      };

      try {
        if (oCredentialsPageState.nEditingAwardId) {
          await fnApiRequest(`/api/awards/${oCredentialsPageState.nEditingAwardId}`, {
            method: 'PUT',
            body: JSON.stringify(oPayload)
          });
        } else {
          await fnApiRequest('/api/awards', {
            method: 'POST',
            body: JSON.stringify(oPayload)
          });
        }

        cEvent.target.reset();
        oCredentialsPageState.nEditingAwardId = null;
        document.getElementById('awardSubmitButton').textContent = 'Save Award';
        fnShowAlert('credentialsAlert', 'Award saved successfully.');
        await fnLoadCredentialsPage();
      } catch (cError) {
        fnShowAlert('credentialsAlert', cError.message, 'danger');
      }
    });

    document.getElementById('pageInteractionShell').addEventListener('click', async (cEvent) => {
      const cButton = cEvent.target.closest('button');

      if (!cButton) {
        return;
      }

      const cAction = cButton.dataset.action;

      if (cAction === 'edit-certification') {
        const oCertification = oAppState.aCertifications.find((oItem) => oItem.certificationId === Number(cButton.dataset.certificationId));

        if (!oCertification) {
          return;
        }

        oCredentialsPageState.nEditingCertificationId = oCertification.certificationId;
        document.getElementById('certificationName').value = oCertification.certificationName;
        document.getElementById('certificationOrganization').value = oCertification.issuingOrganization;
        document.getElementById('certificationDate').value = oCertification.issuedDate || '';
        document.getElementById('certificationDescription').value = oCertification.description || '';
        document.getElementById('certificationSubmitButton').textContent = 'Update Certification';
      }

      if (cAction === 'delete-certification') {
        await fnApiRequest(`/api/certifications/${Number(cButton.dataset.certificationId)}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
        fnShowAlert('credentialsAlert', 'Certification deleted successfully.');
        await fnLoadCredentialsPage();
      }

      if (cAction === 'edit-award') {
        const oAward = oAppState.aAwards.find((oItem) => oItem.awardId === Number(cButton.dataset.awardId));

        if (!oAward) {
          return;
        }

        oCredentialsPageState.nEditingAwardId = oAward.awardId;
        document.getElementById('awardName').value = oAward.awardName;
        document.getElementById('awardOrganization').value = oAward.issuingOrganization;
        document.getElementById('awardDate').value = oAward.awardedDate || '';
        document.getElementById('awardDescription').value = oAward.description || '';
        document.getElementById('awardSubmitButton').textContent = 'Update Award';
      }

      if (cAction === 'delete-award') {
        await fnApiRequest(`/api/awards/${Number(cButton.dataset.awardId)}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
        fnShowAlert('credentialsAlert', 'Award deleted successfully.');
        await fnLoadCredentialsPage();
      }
    });

    window.fnMarkViewInitialized('/credentials');
  }

  await fnLoadCredentialsPage();
};
