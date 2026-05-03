const oJobsPageState = {
  nEditingJobId: null,
  nEditingResponsibilityId: null
};

const fnLoadJobsPage = async () => {
  const nUserId = fnGetCurrentUserId();
  const aJobs = await fnApiRequest(`/api/jobs?userId=${nUserId}`);
  oAppState.aJobs = aJobs;

  const cJobList = document.getElementById('jobList');
  const cResponsibilityJobSelect = document.getElementById('responsibilityJobId');
  cResponsibilityJobSelect.innerHTML = '<option value="">Choose a job</option>';

  cJobList.innerHTML = aJobs.map((oJob) => {
    const cResponsibilityMarkup = (oJob.responsibilities || []).map((oResponsibility) => {
      return `
        <li class="list-group-item">
          <div class="d-flex justify-content-between gap-3 align-items-start">
            <span>${fnEscapeHtml(oResponsibility.description)}</span>
            <div class="btn-group btn-group-sm" role="group" aria-label="Responsibility actions">
              <button type="button" class="btn btn-outline-secondary" data-action="edit-responsibility" data-responsibility-id="${oResponsibility.responsibilityId}" data-job-id="${oJob.jobId}">Edit</button>
              <button type="button" class="btn btn-outline-danger" data-action="delete-responsibility" data-responsibility-id="${oResponsibility.responsibilityId}">Delete</button>
            </div>
          </div>
        </li>
      `;
    }).join('');

    cResponsibilityJobSelect.insertAdjacentHTML('beforeend', `<option value="${oJob.jobId}">${fnEscapeHtml(oJob.title)} - ${fnEscapeHtml(oJob.company)}</option>`);

    return `
      <article class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 class="h4 mb-1">${fnEscapeHtml(oJob.title)}</h2>
              <p class="mb-1 fw-semibold">${fnEscapeHtml(oJob.company)}</p>
              <p class="mb-2 text-body-secondary">${fnFormatMonth(oJob.startDate)} - ${fnFormatMonth(oJob.endDate)} | ${fnEscapeHtml(oJob.location || 'Location not provided')}</p>
              <p class="mb-3">${fnEscapeHtml(oJob.summary || 'No summary provided yet.')}</p>
            </div>
            <div class="btn-group" role="group" aria-label="Job actions">
              <button type="button" class="btn btn-outline-secondary" data-action="edit-job" data-job-id="${oJob.jobId}">Edit</button>
              <button type="button" class="btn btn-outline-danger" data-action="delete-job" data-job-id="${oJob.jobId}">Delete</button>
            </div>
          </div>
          <h3 class="h6 text-uppercase text-primary mt-3">Responsibilities</h3>
          <ul class="list-group list-group-flush">
            ${cResponsibilityMarkup || '<li class="list-group-item">No responsibilities added yet.</li>'}
          </ul>
        </div>
      </article>
    `;
  }).join('');
};

document.addEventListener('DOMContentLoaded', async () => {
  const cJobForm = document.getElementById('jobForm');
  const cResponsibilityForm = document.getElementById('responsibilityForm');
  const cJobList = document.getElementById('jobList');

  await fnLoadJobsPage();

  cJobForm.addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    fnClearAlert('jobsAlert');

    const oPayload = {
      userId: fnGetCurrentUserId(),
      title: document.getElementById('jobTitle').value,
      company: document.getElementById('jobCompany').value,
      startDate: document.getElementById('jobStartDate').value,
      endDate: document.getElementById('jobEndDate').value || 'Present',
      location: document.getElementById('jobLocation').value,
      summary: document.getElementById('jobSummary').value
    };

    try {
      if (oJobsPageState.nEditingJobId) {
        await fnApiRequest(`/api/jobs/${oJobsPageState.nEditingJobId}`, {
          method: 'PUT',
          body: JSON.stringify(oPayload)
        });
      } else {
        await fnApiRequest('/api/jobs', {
          method: 'POST',
          body: JSON.stringify(oPayload)
        });
      }

      cJobForm.reset();
      oJobsPageState.nEditingJobId = null;
      document.getElementById('jobSubmitButton').textContent = 'Save Job';
      fnShowAlert('jobsAlert', 'Job saved successfully.');
      await fnLoadJobsPage();
    } catch (cError) {
      fnShowAlert('jobsAlert', cError.message, 'danger');
    }
  });

  cResponsibilityForm.addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    fnClearAlert('responsibilitiesAlert');

    const oPayload = {
      userId: fnGetCurrentUserId(),
      jobId: document.getElementById('responsibilityJobId').value,
      description: document.getElementById('responsibilityDescription').value
    };

    try {
      if (oJobsPageState.nEditingResponsibilityId) {
        await fnApiRequest(`/api/responsibilities/${oJobsPageState.nEditingResponsibilityId}`, {
          method: 'PUT',
          body: JSON.stringify(oPayload)
        });
      } else {
        await fnApiRequest('/api/responsibilities', {
          method: 'POST',
          body: JSON.stringify(oPayload)
        });
      }

      cResponsibilityForm.reset();
      oJobsPageState.nEditingResponsibilityId = null;
      document.getElementById('responsibilitySubmitButton').textContent = 'Save Responsibility';
      fnShowAlert('responsibilitiesAlert', 'Responsibility saved successfully.');
      await fnLoadJobsPage();
    } catch (cError) {
      fnShowAlert('responsibilitiesAlert', cError.message, 'danger');
    }
  });

  document.getElementById('jobSuggestionButton').addEventListener('click', async () => {
    await fnOpenSuggestionModal('jobSummary', 'job summary');
  });

  document.getElementById('responsibilitySuggestionButton').addEventListener('click', async () => {
    await fnOpenSuggestionModal('responsibilityDescription', 'job responsibility');
  });

  cJobList.addEventListener('click', async (cEvent) => {
    const cButton = cEvent.target.closest('button');

    if (!cButton) {
      return;
    }

    const cAction = cButton.dataset.action;

    if (cAction === 'edit-job') {
      const nJobId = Number(cButton.dataset.jobId);
      const oJob = oAppState.aJobs.find((oItem) => oItem.jobId === nJobId);

      if (!oJob) {
        return;
      }

      oJobsPageState.nEditingJobId = nJobId;
      document.getElementById('jobTitle').value = oJob.title;
      document.getElementById('jobCompany').value = oJob.company;
      document.getElementById('jobStartDate').value = oJob.startDate;
      document.getElementById('jobEndDate').value = oJob.endDate === 'Present' ? '' : oJob.endDate;
      document.getElementById('jobLocation').value = oJob.location || '';
      document.getElementById('jobSummary').value = oJob.summary || '';
      document.getElementById('jobSubmitButton').textContent = 'Update Job';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (cAction === 'delete-job') {
      const nJobId = Number(cButton.dataset.jobId);
      await fnApiRequest(`/api/jobs/${nJobId}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
      fnShowAlert('jobsAlert', 'Job deleted successfully.');
      await fnLoadJobsPage();
    }

    if (cAction === 'edit-responsibility') {
      oJobsPageState.nEditingResponsibilityId = Number(cButton.dataset.responsibilityId);
      document.getElementById('responsibilityJobId').value = cButton.dataset.jobId;
      const oJob = oAppState.aJobs.find((oItem) => oItem.jobId === Number(cButton.dataset.jobId));
      const oResponsibility = oJob?.responsibilities?.find((oItem) => oItem.responsibilityId === Number(cButton.dataset.responsibilityId));
      document.getElementById('responsibilityDescription').value = oResponsibility?.description || '';
      document.getElementById('responsibilitySubmitButton').textContent = 'Update Responsibility';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    if (cAction === 'delete-responsibility') {
      const nResponsibilityId = Number(cButton.dataset.responsibilityId);
      await fnApiRequest(`/api/responsibilities/${nResponsibilityId}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
      fnShowAlert('responsibilitiesAlert', 'Responsibility deleted successfully.');
      await fnLoadJobsPage();
    }
  });
});
