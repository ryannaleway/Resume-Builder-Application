const fnLoadDashboardView = async () => {
  try {
    const nUserId = fnGetCurrentUserId();
    const [aJobs, aEducationEntries, aSkills, aCertifications, aAwards] = await Promise.all([
      fnApiRequest(`/api/jobs?userId=${nUserId}`),
      fnApiRequest(`/api/education?userId=${nUserId}`),
      fnApiRequest(`/api/skills?userId=${nUserId}`),
      fnApiRequest(`/api/certifications?userId=${nUserId}`),
      fnApiRequest(`/api/awards?userId=${nUserId}`)
    ]);

    document.getElementById('jobCount').textContent = aJobs.length;
    document.getElementById('educationCount').textContent = aEducationEntries.length;
    document.getElementById('skillCount').textContent = aSkills.length;
    document.getElementById('certificationCount').textContent = aCertifications.length;
    document.getElementById('awardCount').textContent = aAwards.length;

    document.getElementById('recentContent').innerHTML = aJobs.slice(0, 3).map((oJob) => {
      return `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <p class="fw-semibold mb-1">${fnEscapeHtml(oJob.title)}</p>
            <p class="mb-0 text-body-secondary">${fnEscapeHtml(oJob.company)}</p>
          </div>
          <span class="badge text-bg-primary rounded-pill">${fnFormatMonth(oJob.startDate)}</span>
        </li>
      `;
    }).join('');
  } catch (cError) {
    fnShowAlert('dashboardAlert', cError.message, 'danger');
  }
};

window.fnInitializeDashboardView = async () => {
  await fnLoadDashboardView();
};
