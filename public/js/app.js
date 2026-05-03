const oAppState = {
  oCurrentUser: null,
  cCurrentRoute: '/',
  cContactMode: 'email',
  aJobs: [],
  aEducationEntries: [],
  aResponsibilities: [],
  aSkillCategories: [],
  aSkills: [],
  aCertifications: [],
  aAwards: [],
  oSelections: {
    aJobIds: [],
    aEducationEntryIds: [],
    aResponsibilityIds: [],
    aSkillIds: [],
    aCertificationIds: [],
    aAwardIds: []
  }
};

const oRouteMetadata = {
  '/': { cTitle: 'Dashboard | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/jobs': { cTitle: 'Manage Jobs | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/education': { cTitle: 'Manage Education | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/skills': { cTitle: 'Manage Skills | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/credentials': { cTitle: 'Credentials & Settings | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/builder': { cTitle: 'Resume Builder | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/preview': { cTitle: 'Resume Preview | ResumeForge Builder', bRequiresAuth: true, cUserShell: 'app' },
  '/auth': { cTitle: 'Sign In | ResumeForge Builder', bRequiresAuth: false, cUserShell: 'auth' }
};

const oViewInitializationState = {};

const fnGetCurrentUserId = () => {
  const oCurrentUser = fnGetCurrentUser();
  return oCurrentUser?.userId || null;
};

const fnGetUserScopedStorageKey = (cKey) => {
  const nUserId = fnGetCurrentUserId();
  return nUserId ? `${cKey}_${nUserId}` : cKey;
};

const fnGetCurrentUser = () => {
  const cStoredUser = localStorage.getItem('resumeBuilderCurrentUser');

  if (!cStoredUser) {
    return null;
  }

  try {
    return JSON.parse(cStoredUser);
  } catch (cError) {
    return null;
  }
};

const fnSetCurrentUser = (oUser) => {
  oAppState.oCurrentUser = oUser;
  localStorage.setItem('resumeBuilderCurrentUser', JSON.stringify(oUser));
};

const fnClearCurrentUser = () => {
  oAppState.oCurrentUser = null;
  localStorage.removeItem('resumeBuilderCurrentUser');
};

const fnShowToast = (cTitle, cIcon = 'success') => {
  if (typeof Swal === 'undefined') {
    return;
  }

  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    icon: cIcon,
    title: cTitle
  });
};

const fnShowAlert = (cContainerId, cMessage, cVariant = 'success') => {
  const cContainer = document.getElementById(cContainerId);

  if (!cContainer) {
    return;
  }

  cContainer.innerHTML = `
    <div class="alert alert-${cVariant}" role="alert">
      ${cMessage}
    </div>
  `;

  fnShowToast(cMessage, cVariant === 'danger' ? 'error' : cVariant === 'warning' ? 'warning' : 'success');
};

const fnClearAlert = (cContainerId) => {
  const cContainer = document.getElementById(cContainerId);

  if (cContainer) {
    cContainer.innerHTML = '';
  }
};

const fnApiRequest = async (cUrl, cOptions = {}) => {
  const cResponse = await fetch(cUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...(cOptions.headers || {})
    },
    ...cOptions
  });

  const cPayloadText = await cResponse.text();
  const oPayload = cPayloadText ? JSON.parse(cPayloadText) : null;

  if (!cResponse.ok) {
    throw new Error(oPayload?.message || 'The request could not be completed.');
  }

  return oPayload;
};

const fnPersistSelections = () => {
  localStorage.setItem(fnGetUserScopedStorageKey('resumeBuilderSelections'), JSON.stringify(oAppState.oSelections));
};

const fnLoadSelections = () => {
  const cStoredSelections = localStorage.getItem(fnGetUserScopedStorageKey('resumeBuilderSelections'));

  if (!cStoredSelections) {
    return;
  }

  try {
    const oStoredSelections = JSON.parse(cStoredSelections);
    oAppState.oSelections = {
      aJobIds: oStoredSelections.aJobIds || [],
      aEducationEntryIds: oStoredSelections.aEducationEntryIds || [],
      aResponsibilityIds: oStoredSelections.aResponsibilityIds || [],
      aSkillIds: oStoredSelections.aSkillIds || [],
      aCertificationIds: oStoredSelections.aCertificationIds || [],
      aAwardIds: oStoredSelections.aAwardIds || []
    };
  } catch (cError) {
    console.error('Unable to load previous resume selections.', cError);
  }
};

const fnPersistContactMode = () => {
  localStorage.setItem(fnGetUserScopedStorageKey('resumeBuilderContactMode'), oAppState.cContactMode);
};

const fnLoadContactMode = () => {
  oAppState.cContactMode = localStorage.getItem(fnGetUserScopedStorageKey('resumeBuilderContactMode')) || 'email';
};

const fnFormatMonth = (cDateValue) => {
  if (!cDateValue || cDateValue === 'Present') {
    return cDateValue || '';
  }

  const cDate = new Date(`${cDateValue}-01T00:00:00`);

  if (Number.isNaN(cDate.getTime())) {
    return cDateValue;
  }

  return cDate.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric'
  });
};

const fnEscapeHtml = (cValue) => {
  return String(cValue || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const fnBuildResumeMarkup = (oResume) => {
  const oProfile = oResume.profile || {};
  const oUser = oResume.user || {};
  const cContactMode = oResume.contactMode || 'email';
  const aContactParts = [];

  if ((cContactMode === 'email' || cContactMode === 'both') && oUser.email) {
    aContactParts.push(oUser.email);
  }

  if ((cContactMode === 'phone' || cContactMode === 'both') && oUser.phone) {
    aContactParts.push(oUser.phone);
  }

  const cHeaderContact = aContactParts.join(' | ') || oUser.email || oUser.phone || 'Preferred contact will appear here after sign in.';
  const aJobMarkup = oResume.jobs.map((oJob) => {
    const cResponsibilitiesMarkup = oJob.responsibilities.map((oResponsibility) => {
      return `<li class="mb-2">${fnEscapeHtml(oResponsibility.description)}</li>`;
    }).join('');

    return `
      <section class="mb-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h3 class="h5 mb-1">${fnEscapeHtml(oJob.title)}</h3>
            <p class="mb-1 fw-semibold">${fnEscapeHtml(oJob.company)}</p>
            <p class="mb-2 text-body-secondary">${fnEscapeHtml(oJob.location || '')}</p>
          </div>
          <p class="mb-0 text-body-secondary">${fnFormatMonth(oJob.startDate)} - ${fnFormatMonth(oJob.endDate)}</p>
        </div>
        ${oJob.summary ? `<p class="mb-2">${fnEscapeHtml(oJob.summary)}</p>` : ''}
        <ul class="mb-0 ps-3">
          ${cResponsibilitiesMarkup}
        </ul>
      </section>
    `;
  }).join('');

  const bHasJobs = oResume.jobs.length > 0;
  const cEducationMarkup = (oResume.educationEntries || []).map((oEducationEntry) => {
    const cDegreeLine = [oEducationEntry.degreeName, oEducationEntry.majorName].filter(Boolean).join(' in ');
    const cDateLine = [fnFormatMonth(oEducationEntry.startDate), fnFormatMonth(oEducationEntry.endDate || oEducationEntry.graduationDate)].filter(Boolean).join(' - ');

    return `
      <section class="mb-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h3 class="h5 mb-1">${fnEscapeHtml(oEducationEntry.schoolName)}</h3>
            ${cDegreeLine ? `<p class="mb-1 fw-semibold">${fnEscapeHtml(cDegreeLine)}</p>` : ''}
            ${oEducationEntry.location ? `<p class="mb-1 text-body-secondary">${fnEscapeHtml(oEducationEntry.location)}</p>` : ''}
          </div>
          ${cDateLine ? `<p class="mb-0 text-body-secondary">${fnEscapeHtml(cDateLine)}</p>` : ''}
        </div>
        ${oEducationEntry.notes ? `<p class="mb-0">${fnEscapeHtml(oEducationEntry.notes)}</p>` : ''}
      </section>
    `;
  }).join('');
  const bHasEducation = (oResume.educationEntries || []).length > 0;
  const cSkillsMarkup = Object.entries(oResume.skillsByCategory).map(([cCategoryName, aSkills]) => {
    return `
      <div class="mb-3">
        <h3 class="h6 text-uppercase text-primary">${fnEscapeHtml(cCategoryName)}</h3>
        <p class="mb-0">${aSkills.map((oSkill) => fnEscapeHtml(oSkill.skillName)).join(', ')}</p>
      </div>
    `;
  }).join('');
  const bHasSkills = Object.keys(oResume.skillsByCategory).length > 0;

  const cCertificationsMarkup = oResume.certifications.map((oCertification) => {
    return `
      <li class="mb-2">
        <span class="fw-semibold">${fnEscapeHtml(oCertification.certificationName)}</span>
        <span class="text-body-secondary"> | ${fnEscapeHtml(oCertification.issuingOrganization)}</span>
      </li>
    `;
  }).join('');
  const bHasCertifications = oResume.certifications.length > 0;

  const cAwardsMarkup = oResume.awards.map((oAward) => {
    return `
      <li class="mb-2">
        <span class="fw-semibold">${fnEscapeHtml(oAward.awardName)}</span>
        <span class="text-body-secondary"> | ${fnEscapeHtml(oAward.issuingOrganization)}</span>
      </li>
    `;
  }).join('');
  const bHasAwards = oResume.awards.length > 0;

  return `
    <article class="resume-paper rounded-4 p-4 p-lg-5 mx-auto" aria-label="Resume preview document">
      <header class="resume-heading pb-3 mb-4">
        <h1 class="display-5 fw-bold mb-1">${fnEscapeHtml(`${oUser.firstName || ''} ${oUser.lastName || ''}`.trim() || 'Resume Preview')}</h1>
        <p class="mb-2 text-body-secondary">${fnEscapeHtml(cHeaderContact)}</p>
        <h2 class="h4 mb-2">${fnEscapeHtml(oProfile.targetRole || 'Professional Resume')}</h2>
        <p class="lead mb-0">${fnEscapeHtml(oProfile.professionalSummary || 'Select your resume content to generate a tailored preview.')}</p>
      </header>
      ${bHasJobs ? `
      <section class="mb-4">
        <h2 class="h5 text-uppercase text-primary">Professional Experience</h2>
        ${aJobMarkup}
      </section>
      ` : ''}
      ${bHasEducation ? `
      <section class="mb-4">
        <h2 class="h5 text-uppercase text-primary">Education</h2>
        ${cEducationMarkup}
      </section>
      ` : ''}
      ${bHasSkills ? `
      <section class="mb-4">
        <h2 class="h5 text-uppercase text-primary">Skills</h2>
        ${cSkillsMarkup}
      </section>
      ` : ''}
      ${bHasCertifications ? `
      <section class="mb-4">
        <h2 class="h5 text-uppercase text-primary">Certifications</h2>
        <ul class="ps-3 mb-0">
          ${cCertificationsMarkup}
        </ul>
      </section>
      ` : ''}
      ${bHasAwards ? `
      <section>
        <h2 class="h5 text-uppercase text-primary">Awards</h2>
        <ul class="ps-3 mb-0">
          ${cAwardsMarkup}
        </ul>
      </section>
      ` : ''}
    </article>
  `;
};

const fnGetSelectionQuery = () => {
  const oSelections = oAppState.oSelections;
  const cQuery = new URLSearchParams();
  const oCurrentUser = fnGetCurrentUser();

  if (oCurrentUser?.userId) {
    cQuery.set('userId', String(oCurrentUser.userId));
  }

  cQuery.set('contactMode', oAppState.cContactMode);
  cQuery.set('jobIds', oSelections.aJobIds.join(','));
  cQuery.set('educationEntryIds', oSelections.aEducationEntryIds.join(','));
  cQuery.set('responsibilityIds', oSelections.aResponsibilityIds.join(','));
  cQuery.set('skillIds', oSelections.aSkillIds.join(','));
  cQuery.set('certificationIds', oSelections.aCertificationIds.join(','));
  cQuery.set('awardIds', oSelections.aAwardIds.join(','));

  return cQuery.toString();
};

const fnFetchResumePreview = async () => {
  const aResume = await fnApiRequest(`/api/resumes?${fnGetSelectionQuery()}`);
  return aResume[0];
};

const fnHydrateAuthUi = () => {
  const oCurrentUser = fnGetCurrentUser();
  oAppState.oCurrentUser = oCurrentUser;

  document.querySelectorAll('[data-user-name]').forEach((cElement) => {
    cElement.textContent = oCurrentUser ? `${oCurrentUser.firstName} ${oCurrentUser.lastName}` : 'Guest';
  });

  document.querySelectorAll('[data-user-email]').forEach((cElement) => {
    cElement.textContent = oCurrentUser?.email || oCurrentUser?.phone || '';
  });
};

const fnNormalizeRoute = (cPathname = window.location.pathname) => {
  const cCleanPath = cPathname.endsWith('/') && cPathname.length > 1 ? cPathname.slice(0, -1) : cPathname;
  return oRouteMetadata[cCleanPath] ? cCleanPath : '/';
};

const fnSetActiveNavigation = (cRoute) => {
  document.querySelectorAll('[data-route-link]').forEach((cLink) => {
    cLink.classList.toggle('active', cLink.dataset.routeLink === cRoute);
    cLink.setAttribute('aria-current', cLink.dataset.routeLink === cRoute ? 'page' : 'false');
  });
};

const fnToggleShells = (cRoute) => {
  const oRoute = oRouteMetadata[cRoute] || oRouteMetadata['/'];
  const cAuthShell = document.getElementById('authShell');
  const cAppShell = document.getElementById('appShell');

  if (oRoute.cUserShell === 'auth') {
    cAuthShell.classList.remove('d-none');
    cAppShell.classList.add('d-none');
    return;
  }

  cAuthShell.classList.add('d-none');
  cAppShell.classList.remove('d-none');
};

const fnShowView = (cRoute) => {
  document.querySelectorAll('[data-view]').forEach((cSection) => {
    cSection.classList.toggle('d-none', cSection.dataset.view !== cRoute);
  });
};

const fnEnsureAuthenticatedRoute = (cRoute) => {
  const oRoute = oRouteMetadata[cRoute] || oRouteMetadata['/'];

  if (oRoute.bRequiresAuth && !fnGetCurrentUser()) {
    return '/auth';
  }

  if (cRoute === '/auth' && fnGetCurrentUser()) {
    return '/';
  }

  return cRoute;
};

const fnNavigateToRoute = async (cRoute, bReplaceHistory = false) => {
  const cTargetRoute = fnEnsureAuthenticatedRoute(fnNormalizeRoute(cRoute));

  if (window.location.pathname !== cTargetRoute) {
    window.history[bReplaceHistory ? 'replaceState' : 'pushState']({}, '', cTargetRoute);
  }

  await fnRenderRoute(cTargetRoute);
};

const fnRenderRoute = async (cRequestedRoute) => {
  const cRoute = fnEnsureAuthenticatedRoute(fnNormalizeRoute(cRequestedRoute));
  const oRoute = oRouteMetadata[cRoute] || oRouteMetadata['/'];
  oAppState.cCurrentRoute = cRoute;

  if (window.location.pathname !== cRoute) {
    window.history.replaceState({}, '', cRoute);
  }

  document.title = oRoute.cTitle;
  fnHydrateAuthUi();
  fnToggleShells(cRoute);
  fnShowView(cRoute);
  fnSetActiveNavigation(cRoute);

  if (typeof window.fnInitializeRouteView === 'function') {
    await window.fnInitializeRouteView(cRoute);
  }
};

const fnRegisterNavigation = () => {
  document.addEventListener('click', async (cEvent) => {
    const cRouteLink = cEvent.target.closest('[data-route-link]');
    const cActionButton = cEvent.target.closest('[data-action]');

    if (cRouteLink) {
      cEvent.preventDefault();
      await fnNavigateToRoute(cRouteLink.dataset.routeLink);
      return;
    }

    if (!cActionButton) {
      return;
    }

    if (cActionButton.dataset.action === 'logout') {
      fnClearCurrentUser();
      await fnNavigateToRoute('/auth', true);
      return;
    }

    if (cActionButton.dataset.action === 'open-libraries') {
      const cLibrariesModalElement = document.getElementById('librariesModal');
      const cLibrariesModal = bootstrap.Modal.getOrCreateInstance(cLibrariesModalElement);
      cLibrariesModal.show();
    }
  });

  window.addEventListener('popstate', async () => {
    await fnRenderRoute(window.location.pathname);
  });
};

window.fnMarkViewInitialized = (cRoute) => {
  oViewInitializationState[cRoute] = true;
};

window.fnHasViewBeenInitialized = (cRoute) => {
  return Boolean(oViewInitializationState[cRoute]);
};

window.fnInitializeRouteView = async (cRoute) => {
  if (cRoute === '/auth' && typeof window.fnInitializeAuthView === 'function') {
    window.fnInitializeAuthView();
    return;
  }

  if (cRoute === '/' && typeof window.fnInitializeDashboardView === 'function') {
    await window.fnInitializeDashboardView();
    return;
  }

  if (cRoute === '/jobs' && typeof window.fnInitializeJobsView === 'function') {
    await window.fnInitializeJobsView();
    return;
  }

  if (cRoute === '/education' && typeof window.fnInitializeEducationView === 'function') {
    await window.fnInitializeEducationView();
    return;
  }

  if (cRoute === '/skills' && typeof window.fnInitializeSkillsView === 'function') {
    await window.fnInitializeSkillsView();
    return;
  }

  if (cRoute === '/credentials' && typeof window.fnInitializeCredentialsView === 'function') {
    await window.fnInitializeCredentialsView();
    return;
  }

  if (cRoute === '/builder' && typeof window.fnInitializeBuilderView === 'function') {
    await window.fnInitializeBuilderView();
    return;
  }

  if (cRoute === '/preview' && typeof window.fnInitializePreviewView === 'function') {
    await window.fnInitializePreviewView();
  }
};

window.fnNavigateToRoute = fnNavigateToRoute;
window.fnRenderRoute = fnRenderRoute;

document.addEventListener('DOMContentLoaded', async () => {
  fnRegisterNavigation();
  await fnRenderRoute(window.location.pathname);
});
