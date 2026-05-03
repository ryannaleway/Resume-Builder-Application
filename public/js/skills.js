const oSkillsPageState = {
  nEditingSkillCategoryId: null,
  nEditingSkillId: null
};

const fnLoadSkillsPage = async () => {
  const nUserId = fnGetCurrentUserId();
  const [aSkillCategories, aSkills] = await Promise.all([
    fnApiRequest(`/api/skill-categories?userId=${nUserId}`),
    fnApiRequest(`/api/skills?userId=${nUserId}`)
  ]);

  oAppState.aSkillCategories = aSkillCategories;
  oAppState.aSkills = aSkills;

  const cCategorySelect = document.getElementById('skillCategoryId');
  cCategorySelect.innerHTML = '<option value="">Choose a category</option>';

  aSkillCategories.forEach((oCategory) => {
    cCategorySelect.insertAdjacentHTML('beforeend', `<option value="${oCategory.skillCategoryId}">${fnEscapeHtml(oCategory.categoryName)}</option>`);
  });

  document.getElementById('categoryList').innerHTML = aSkillCategories.map((oCategory) => {
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${fnEscapeHtml(oCategory.categoryName)}</span>
        <div class="btn-group btn-group-sm" role="group" aria-label="Category actions">
          <button type="button" class="btn btn-outline-secondary" data-action="edit-category" data-skill-category-id="${oCategory.skillCategoryId}">Edit</button>
          <button type="button" class="btn btn-outline-danger" data-action="delete-category" data-skill-category-id="${oCategory.skillCategoryId}">Delete</button>
        </div>
      </li>
    `;
  }).join('');

  document.getElementById('skillList').innerHTML = aSkills.map((oSkill) => {
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
        <div>
          <p class="fw-semibold mb-1">${fnEscapeHtml(oSkill.skillName)}</p>
          <p class="mb-0 text-body-secondary">${fnEscapeHtml(oSkill.categoryName)}${oSkill.proficiency ? ` | ${fnEscapeHtml(oSkill.proficiency)}` : ''}</p>
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Skill actions">
          <button type="button" class="btn btn-outline-secondary" data-action="edit-skill" data-skill-id="${oSkill.skillId}">Edit</button>
          <button type="button" class="btn btn-outline-danger" data-action="delete-skill" data-skill-id="${oSkill.skillId}">Delete</button>
        </div>
      </li>
    `;
  }).join('');

};

document.addEventListener('DOMContentLoaded', async () => {
  await fnLoadSkillsPage();

  document.getElementById('skillSuggestionButton').addEventListener('click', async () => {
    await fnOpenSuggestionModal('skillName', 'skill');
  });

  document.getElementById('categoryForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    const oPayload = {
      userId: fnGetCurrentUserId(),
      categoryName: document.getElementById('categoryName').value
    };

    try {
      if (oSkillsPageState.nEditingSkillCategoryId) {
        await fnApiRequest(`/api/skill-categories/${oSkillsPageState.nEditingSkillCategoryId}`, {
          method: 'PUT',
          body: JSON.stringify(oPayload)
        });
      } else {
        await fnApiRequest('/api/skill-categories', {
          method: 'POST',
          body: JSON.stringify(oPayload)
        });
      }

      cEvent.target.reset();
      oSkillsPageState.nEditingSkillCategoryId = null;
      document.getElementById('categorySubmitButton').textContent = 'Save Category';
      fnShowAlert('skillsAlert', 'Skill category saved successfully.');
      await fnLoadSkillsPage();
    } catch (cError) {
      fnShowAlert('skillsAlert', cError.message, 'danger');
    }
  });

  document.getElementById('skillForm').addEventListener('submit', async (cEvent) => {
    cEvent.preventDefault();
    const oPayload = {
      userId: fnGetCurrentUserId(),
      skillCategoryId: document.getElementById('skillCategoryId').value,
      skillName: document.getElementById('skillName').value,
      proficiency: document.getElementById('skillProficiency').value
    };

    try {
      if (oSkillsPageState.nEditingSkillId) {
        await fnApiRequest(`/api/skills/${oSkillsPageState.nEditingSkillId}`, {
          method: 'PUT',
          body: JSON.stringify(oPayload)
        });
      } else {
        await fnApiRequest('/api/skills', {
          method: 'POST',
          body: JSON.stringify(oPayload)
        });
      }

      cEvent.target.reset();
      oSkillsPageState.nEditingSkillId = null;
      document.getElementById('skillSubmitButton').textContent = 'Save Skill';
      fnShowAlert('skillsAlert', 'Skill saved successfully.');
      await fnLoadSkillsPage();
    } catch (cError) {
      fnShowAlert('skillsAlert', cError.message, 'danger');
    }
  });

  document.getElementById('pageInteractionShell').addEventListener('click', async (cEvent) => {
    const cButton = cEvent.target.closest('button');

    if (!cButton) {
      return;
    }

    const cAction = cButton.dataset.action;

    if (cAction === 'edit-category') {
      const oCategory = oAppState.aSkillCategories.find((oItem) => oItem.skillCategoryId === Number(cButton.dataset.skillCategoryId));
      oSkillsPageState.nEditingSkillCategoryId = oCategory.skillCategoryId;
      document.getElementById('categoryName').value = oCategory.categoryName;
      document.getElementById('categorySubmitButton').textContent = 'Update Category';
    }

    if (cAction === 'delete-category') {
      await fnApiRequest(`/api/skill-categories/${Number(cButton.dataset.skillCategoryId)}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
      fnShowAlert('skillsAlert', 'Skill category deleted successfully.');
      await fnLoadSkillsPage();
    }

    if (cAction === 'edit-skill') {
      const oSkill = oAppState.aSkills.find((oItem) => oItem.skillId === Number(cButton.dataset.skillId));
      oSkillsPageState.nEditingSkillId = oSkill.skillId;
      document.getElementById('skillCategoryId').value = oSkill.skillCategoryId;
      document.getElementById('skillName').value = oSkill.skillName;
      document.getElementById('skillProficiency').value = oSkill.proficiency || '';
      document.getElementById('skillSubmitButton').textContent = 'Update Skill';
    }

    if (cAction === 'delete-skill') {
      await fnApiRequest(`/api/skills/${Number(cButton.dataset.skillId)}?userId=${fnGetCurrentUserId()}`, { method: 'DELETE' });
      fnShowAlert('skillsAlert', 'Skill deleted successfully.');
      await fnLoadSkillsPage();
    }

  });
});
