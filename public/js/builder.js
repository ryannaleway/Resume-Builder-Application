const fnRenderSelectionCards = () => {
  const cSelectionPanel = document.getElementById('selectionPanel');
  const cJobMarkup = oAppState.aJobs.map((oJob) => {
    const cResponsibilitiesMarkup = (oJob.responsibilities || []).map((oResponsibility) => {
      const bChecked = oAppState.oSelections.aResponsibilityIds.includes(oResponsibility.responsibilityId);
      return `
        <div class="form-check ms-3 mb-2">
          <input class="form-check-input selection-control" type="checkbox" value="${oResponsibility.responsibilityId}" id="responsibility_${oResponsibility.responsibilityId}" data-selection-type="responsibility">
          <label class="form-check-label" for="responsibility_${oResponsibility.responsibilityId}">
            ${fnEscapeHtml(oResponsibility.description)}
          </label>
        </div>
      `.replace('type="checkbox"', `type="checkbox"${bChecked ? ' checked' : ''}`);
    }).join('');

    const bJobChecked = oAppState.oSelections.aJobIds.includes(oJob.jobId);

    return `
      <article class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="form-check mb-2">
            <input class="form-check-input selection-control" type="checkbox" value="${oJob.jobId}" id="job_${oJob.jobId}" data-selection-type="job"${bJobChecked ? ' checked' : ''}>
            <label class="form-check-label fw-semibold" for="job_${oJob.jobId}">
              ${fnEscapeHtml(oJob.title)} - ${fnEscapeHtml(oJob.company)}
            </label>
          </div>
          <div>${cResponsibilitiesMarkup}</div>
        </div>
      </article>
    `;
  }).join('');

  const cSkillMarkup = oAppState.aSkillCategories.map((oCategory) => {
    const cCategorySkillMarkup = oAppState.aSkills
      .filter((oSkill) => oSkill.skillCategoryId === oCategory.skillCategoryId)
      .map((oSkill) => {
        const bChecked = oAppState.oSelections.aSkillIds.includes(oSkill.skillId);
        return `
          <div class="form-check mb-2">
            <input class="form-check-input selection-control" type="checkbox" value="${oSkill.skillId}" id="skill_${oSkill.skillId}" data-selection-type="skill"${bChecked ? ' checked' : ''}>
            <label class="form-check-label" for="skill_${oSkill.skillId}">
              ${fnEscapeHtml(oSkill.skillName)}
            </label>
          </div>
        `;
      }).join('');

    return `
      <section class="mb-3">
        <h3 class="h6 text-uppercase text-primary">${fnEscapeHtml(oCategory.categoryName)}</h3>
        ${cCategorySkillMarkup || '<p class="text-body-secondary mb-0">No skills in this category yet.</p>'}
      </section>
    `;
  }).join('');

  const cEducationMarkup = oAppState.aEducationEntries.map((oEducationEntry) => {
    const bChecked = oAppState.oSelections.aEducationEntryIds.includes(oEducationEntry.educationEntryId);
    const cEducationTitle = [oEducationEntry.schoolName, oEducationEntry.degreeName, oEducationEntry.majorName].filter(Boolean).join(' | ');

    return `
      <div class="form-check mb-2">
        <input class="form-check-input selection-control" type="checkbox" value="${oEducationEntry.educationEntryId}" id="education_${oEducationEntry.educationEntryId}" data-selection-type="education">
        <label class="form-check-label" for="education_${oEducationEntry.educationEntryId}">
          ${fnEscapeHtml(cEducationTitle || oEducationEntry.schoolName)}
        </label>
      </div>
    `.replace('type="checkbox"', `type="checkbox"${bChecked ? ' checked' : ''}`);
  }).join('');

  const cCertificationMarkup = oAppState.aCertifications.map((oCertification) => {
    const bChecked = oAppState.oSelections.aCertificationIds.includes(oCertification.certificationId);
    return `
      <div class="form-check mb-2">
        <input class="form-check-input selection-control" type="checkbox" value="${oCertification.certificationId}" id="certification_${oCertification.certificationId}" data-selection-type="certification"${bChecked ? ' checked' : ''}>
        <label class="form-check-label" for="certification_${oCertification.certificationId}">
          ${fnEscapeHtml(oCertification.certificationName)}
        </label>
      </div>
    `;
  }).join('');

  const cAwardMarkup = oAppState.aAwards.map((oAward) => {
    const bChecked = oAppState.oSelections.aAwardIds.includes(oAward.awardId);
    return `
      <div class="form-check mb-2">
        <input class="form-check-input selection-control" type="checkbox" value="${oAward.awardId}" id="award_${oAward.awardId}" data-selection-type="award"${bChecked ? ' checked' : ''}>
        <label class="form-check-label" for="award_${oAward.awardId}">
          ${fnEscapeHtml(oAward.awardName)}
        </label>
      </div>
    `;
  }).join('');

  cSelectionPanel.innerHTML = `
    <section class="mb-4">
      <h2 class="h5">Jobs & Responsibilities</h2>
      ${cJobMarkup || '<p class="mb-0">Add jobs before building a resume.</p>'}
    </section>
    <section class="mb-4">
      <h2 class="h5">Skills</h2>
      ${cSkillMarkup || '<p class="mb-0">Add skills before building a resume.</p>'}
    </section>
    <section class="mb-4">
      <h2 class="h5">Education</h2>
      ${cEducationMarkup || '<p class="mb-0">Add education before building a resume.</p>'}
    </section>
    <section class="mb-4">
      <h2 class="h5">Certifications</h2>
      ${cCertificationMarkup || '<p class="mb-0">Add certifications before building a resume.</p>'}
    </section>
    <section>
      <h2 class="h5">Awards</h2>
      ${cAwardMarkup || '<p class="mb-0">Add awards before building a resume.</p>'}
    </section>
  `;
};

const fnUpdateSelectionState = () => {
  oAppState.oSelections.aJobIds = Array.from(document.querySelectorAll('[data-selection-type="job"]:checked')).map((cInput) => Number(cInput.value));
  oAppState.oSelections.aEducationEntryIds = Array.from(document.querySelectorAll('[data-selection-type="education"]:checked')).map((cInput) => Number(cInput.value));
  oAppState.oSelections.aResponsibilityIds = Array.from(document.querySelectorAll('[data-selection-type="responsibility"]:checked')).map((cInput) => Number(cInput.value));
  oAppState.oSelections.aSkillIds = Array.from(document.querySelectorAll('[data-selection-type="skill"]:checked')).map((cInput) => Number(cInput.value));
  oAppState.oSelections.aCertificationIds = Array.from(document.querySelectorAll('[data-selection-type="certification"]:checked')).map((cInput) => Number(cInput.value));
  oAppState.oSelections.aAwardIds = Array.from(document.querySelectorAll('[data-selection-type="award"]:checked')).map((cInput) => Number(cInput.value));
  fnPersistSelections();
};

const fnRefreshResumePreview = async () => {
  fnUpdateSelectionState();
  const oResume = await fnFetchResumePreview();
  document.getElementById('resumePreviewContainer').innerHTML = fnBuildResumeMarkup(oResume);
  localStorage.setItem(fnGetUserScopedStorageKey('resumeBuilderPreview'), JSON.stringify(oResume));
};

const fnSaveResumeHeaderSettings = async () => {
  const nUserId = fnGetCurrentUserId();
  const cTargetRole = document.getElementById('resumeTargetRole').value.trim();
  const cObjective = document.getElementById('resumeObjective').value.trim();

  await fnApiRequest('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({
      userId: nUserId,
      settingKey: 'resumeTargetRole',
      settingValue: cTargetRole || 'Professional Resume'
    })
  });

  await fnApiRequest('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({
      userId: nUserId,
      settingKey: 'resumeObjective',
      settingValue: cObjective || 'Add a short professional summary tailored to the role you want.'
    })
  });
};

const fnLoadBuilderData = async () => {
  fnLoadSelections();
  fnLoadContactMode();
  const cContactModeField = document.getElementById('resumeContactMode');
  const cTargetRoleField = document.getElementById('resumeTargetRole');
  const cObjectiveField = document.getElementById('resumeObjective');
  cContactModeField.value = oAppState.cContactMode;

  const [aJobs, aEducationEntries, aSkillCategories, aSkills, aCertifications, aAwards, aSettings] = await Promise.all([
    fnApiRequest(`/api/jobs?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/education?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/skill-categories?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/skills?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/certifications?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/awards?userId=${fnGetCurrentUserId()}`),
    fnApiRequest(`/api/settings?userId=${fnGetCurrentUserId()}`)
  ]);

  oAppState.aJobs = aJobs;
  oAppState.aEducationEntries = aEducationEntries;
  oAppState.aSkillCategories = aSkillCategories;
  oAppState.aSkills = aSkills;
  oAppState.aCertifications = aCertifications;
  oAppState.aAwards = aAwards;

  const oResumeTargetRoleSetting = aSettings.find((oItem) => oItem.settingKey === 'resumeTargetRole');
  const oResumeObjectiveSetting = aSettings.find((oItem) => oItem.settingKey === 'resumeObjective');
  cTargetRoleField.value = oResumeTargetRoleSetting?.settingValue || '';
  cObjectiveField.value = oResumeObjectiveSetting?.settingValue || '';

  if (
    oAppState.oSelections.aJobIds.length === 0 &&
    oAppState.oSelections.aEducationEntryIds.length === 0 &&
    oAppState.oSelections.aResponsibilityIds.length === 0 &&
    oAppState.oSelections.aSkillIds.length === 0 &&
    oAppState.oSelections.aCertificationIds.length === 0 &&
    oAppState.oSelections.aAwardIds.length === 0
  ) {
    oAppState.oSelections.aJobIds = aJobs.map((oJob) => oJob.jobId);
    oAppState.oSelections.aEducationEntryIds = aEducationEntries.map((oEducationEntry) => oEducationEntry.educationEntryId);
    oAppState.oSelections.aResponsibilityIds = aJobs.flatMap((oJob) => (oJob.responsibilities || []).map((oResponsibility) => oResponsibility.responsibilityId));
    oAppState.oSelections.aSkillIds = aSkills.map((oSkill) => oSkill.skillId);
    oAppState.oSelections.aCertificationIds = aCertifications.map((oCertification) => oCertification.certificationId);
    oAppState.oSelections.aAwardIds = aAwards.map((oAward) => oAward.awardId);
    fnPersistSelections();
  }

  fnRenderSelectionCards();
  await fnRefreshResumePreview();
};

window.fnInitializeBuilderView = async () => {
  if (!window.fnHasViewBeenInitialized('/builder')) {
    document.getElementById('selectionPanel').addEventListener('change', async (cEvent) => {
      if (cEvent.target.classList.contains('selection-control')) {
        await fnRefreshResumePreview();
      }
    });

    document.getElementById('resumeContactMode').addEventListener('change', async (cEvent) => {
      oAppState.cContactMode = cEvent.target.value;
      fnPersistContactMode();
      await fnRefreshResumePreview();
    });

    document.getElementById('saveResumeProfileButton').addEventListener('click', async () => {
      try {
        await fnSaveResumeHeaderSettings();
        fnShowAlert('globalAlert', 'Resume header details saved successfully.');
        await fnRefreshResumePreview();
      } catch (cError) {
        fnShowAlert('globalAlert', cError.message, 'danger');
      }
    });

    document.getElementById('openPreviewButton').addEventListener('click', async () => {
      await fnNavigateToRoute('/preview');
    });

    window.fnMarkViewInitialized('/builder');
  }

  await fnLoadBuilderData();
};
