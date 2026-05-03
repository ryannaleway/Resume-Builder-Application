const fnDownloadResumePdf = async (oResume) => {
  const { jsPDF } = window.jspdf;
  const cPdfDocument = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const nPageWidth = cPdfDocument.internal.pageSize.getWidth();
  const nPageHeight = cPdfDocument.internal.pageSize.getHeight();
  const nMargin = 12;
  const nContentWidth = nPageWidth - (nMargin * 2);
  const nRightColumnWidth = 42;
  const nLeftColumnWidth = nContentWidth - nRightColumnWidth - 4;
  let nVerticalPosition = 18;
  const cContactMode = oResume.contactMode || 'email';
  const aContactParts = [];

  if ((cContactMode === 'email' || cContactMode === 'both') && oResume.user?.email) {
    aContactParts.push(oResume.user.email);
  }

  if ((cContactMode === 'phone' || cContactMode === 'both') && oResume.user?.phone) {
    aContactParts.push(oResume.user.phone);
  }

  const fnEnsurePageSpace = (nRequiredHeight = 10) => {
    if (nVerticalPosition + nRequiredHeight > nPageHeight - nMargin) {
      cPdfDocument.addPage();
      nVerticalPosition = 18;
    }
  };

  const fnWriteWrappedText = (cText, nX, nY, nWidth, nFontSize = 10.5, cFontStyle = 'normal', nLineHeight = 5) => {
    cPdfDocument.setFont('helvetica', cFontStyle);
    cPdfDocument.setFontSize(nFontSize);
    const aLines = cPdfDocument.splitTextToSize(cText || '', nWidth);
    cPdfDocument.text(aLines, nX, nY);
    return aLines.length * nLineHeight;
  };

  const fnWriteSectionTitle = (cTitle) => {
    fnEnsurePageSpace(12);
    cPdfDocument.setFont('helvetica', 'bold');
    cPdfDocument.setFontSize(12);
    cPdfDocument.text(cTitle.toUpperCase(), nMargin, nVerticalPosition);
    nVerticalPosition += 2;
    cPdfDocument.setDrawColor(13, 110, 253);
    cPdfDocument.setLineWidth(0.5);
    cPdfDocument.line(nMargin, nVerticalPosition, nPageWidth - nMargin, nVerticalPosition);
    nVerticalPosition += 6;
  };

  const fnWriteExperienceBlock = (oJob) => {
    const cDateLine = `${fnFormatMonth(oJob.startDate)} - ${fnFormatMonth(oJob.endDate)}`;
    fnEnsurePageSpace(18);

    cPdfDocument.setFont('helvetica', 'bold');
    cPdfDocument.setFontSize(11.5);
    const nTitleHeight = fnWriteWrappedText(oJob.title || '', nMargin, nVerticalPosition, nLeftColumnWidth, 11.5, 'bold', 5);

    cPdfDocument.setFont('helvetica', 'italic');
    cPdfDocument.setFontSize(10);
    const aDateLines = cPdfDocument.splitTextToSize(cDateLine, nRightColumnWidth);
    cPdfDocument.text(aDateLines, nPageWidth - nMargin, nVerticalPosition, { align: 'right' });

    nVerticalPosition += Math.max(nTitleHeight, aDateLines.length * 5);

    const cCompanyLine = [oJob.company, oJob.location].filter(Boolean).join(' | ');
    if (cCompanyLine) {
      nVerticalPosition += fnWriteWrappedText(cCompanyLine, nMargin, nVerticalPosition, nLeftColumnWidth, 10, 'italic', 4.5);
    }

    if (oJob.summary) {
      nVerticalPosition += fnWriteWrappedText(oJob.summary, nMargin, nVerticalPosition + 1, nContentWidth, 10, 'normal', 4.5);
    }

    (oJob.responsibilities || []).forEach((oResponsibility) => {
      fnEnsurePageSpace(8);
      cPdfDocument.setFont('helvetica', 'normal');
      cPdfDocument.setFontSize(10);
      cPdfDocument.text('\u2022', nMargin + 1.5, nVerticalPosition);
      const aBulletLines = cPdfDocument.splitTextToSize(oResponsibility.description || '', nContentWidth - 8);
      cPdfDocument.text(aBulletLines, nMargin + 6, nVerticalPosition);
      nVerticalPosition += aBulletLines.length * 4.5;
    });

    nVerticalPosition += 4;
  };

  const fnWriteEducationBlock = (oEducationEntry) => {
    fnEnsurePageSpace(16);
    const cDateLine = [fnFormatMonth(oEducationEntry.startDate), fnFormatMonth(oEducationEntry.endDate || oEducationEntry.graduationDate)].filter(Boolean).join(' - ');
    const cProgramLine = [oEducationEntry.degreeName, oEducationEntry.majorName].filter(Boolean).join(' in ');

    const nSchoolHeight = fnWriteWrappedText(oEducationEntry.schoolName || '', nMargin, nVerticalPosition, nLeftColumnWidth, 11, 'bold', 5);

    if (cDateLine) {
      cPdfDocument.setFont('helvetica', 'italic');
      cPdfDocument.setFontSize(10);
      const aDateLines = cPdfDocument.splitTextToSize(cDateLine, nRightColumnWidth);
      cPdfDocument.text(aDateLines, nPageWidth - nMargin, nVerticalPosition, { align: 'right' });
      nVerticalPosition += Math.max(nSchoolHeight, aDateLines.length * 5);
    } else {
      nVerticalPosition += nSchoolHeight;
    }

    if (cProgramLine) {
      nVerticalPosition += fnWriteWrappedText(cProgramLine, nMargin, nVerticalPosition, nLeftColumnWidth, 10, 'italic', 4.5);
    }

    if (oEducationEntry.location) {
      nVerticalPosition += fnWriteWrappedText(oEducationEntry.location, nMargin, nVerticalPosition, nLeftColumnWidth, 10, 'normal', 4.5);
    }

    if (oEducationEntry.notes) {
      nVerticalPosition += fnWriteWrappedText(oEducationEntry.notes, nMargin, nVerticalPosition + 1, nContentWidth, 10, 'normal', 4.5);
    }

    nVerticalPosition += 4;
  };

  const fnWriteSimpleListSection = (cTitle, aLines) => {
    if (aLines.length === 0) {
      return;
    }

    fnWriteSectionTitle(cTitle);
    aLines.forEach((cLine) => {
      fnEnsurePageSpace(7);
      cPdfDocument.setFont('helvetica', 'normal');
      cPdfDocument.setFontSize(10);
      cPdfDocument.text('\u2022', nMargin + 1.5, nVerticalPosition);
      const aWrappedLines = cPdfDocument.splitTextToSize(cLine, nContentWidth - 8);
      cPdfDocument.text(aWrappedLines, nMargin + 6, nVerticalPosition);
      nVerticalPosition += aWrappedLines.length * 4.5;
    });
    nVerticalPosition += 2;
  };

  cPdfDocument.setFont('helvetica', 'bold');
  cPdfDocument.setFontSize(18);
  cPdfDocument.text(`${oResume.user?.firstName || ''} ${oResume.user?.lastName || ''}`.trim() || 'Resume', nMargin, nVerticalPosition);
  nVerticalPosition += 7;

  if (aContactParts.length > 0) {
    nVerticalPosition += fnWriteWrappedText(aContactParts.join(' | '), nMargin, nVerticalPosition, nContentWidth, 10, 'normal', 4.5);
  }

  if (oResume.profile?.targetRole) {
    nVerticalPosition += fnWriteWrappedText(oResume.profile.targetRole, nMargin, nVerticalPosition + 1, nContentWidth, 12, 'bold', 5);
  }

  if (oResume.profile?.professionalSummary) {
    nVerticalPosition += fnWriteWrappedText(oResume.profile.professionalSummary, nMargin, nVerticalPosition + 1, nContentWidth, 10, 'normal', 4.5);
  }

  nVerticalPosition += 3;

  if (oResume.jobs.length > 0) {
    fnWriteSectionTitle('Professional Experience');
    oResume.jobs.forEach((oJob) => {
      fnWriteExperienceBlock(oJob);
    });
  }

  if ((oResume.educationEntries || []).length > 0) {
    fnWriteSectionTitle('Education');
    oResume.educationEntries.forEach((oEducationEntry) => {
      fnWriteEducationBlock(oEducationEntry);
    });
  }

  const aSkillLines = Object.entries(oResume.skillsByCategory || {}).map(([cCategoryName, aSkills]) => {
    return `${cCategoryName}: ${aSkills.map((oSkill) => oSkill.skillName).join(', ')}`;
  });
  fnWriteSimpleListSection('Skills', aSkillLines);

  const aCertificationLines = (oResume.certifications || []).map((oCertification) => {
    return [oCertification.certificationName, oCertification.issuingOrganization].filter(Boolean).join(' | ');
  });
  fnWriteSimpleListSection('Certifications', aCertificationLines);

  const aAwardLines = (oResume.awards || []).map((oAward) => {
    return [oAward.awardName, oAward.issuingOrganization].filter(Boolean).join(' | ');
  });
  fnWriteSimpleListSection('Awards', aAwardLines);

  cPdfDocument.save('resume.pdf');
};

const fnLoadPreviewView = async () => {
  let oResume = null;
  const cStoredPreview = localStorage.getItem(fnGetUserScopedStorageKey('resumeBuilderPreview'));

  if (cStoredPreview) {
    oResume = JSON.parse(cStoredPreview);
  } else {
    fnLoadContactMode();
    oResume = await fnFetchResumePreview();
  }

  document.getElementById('fullResumePreview').innerHTML = fnBuildResumeMarkup(oResume);
  return oResume;
};

window.fnInitializePreviewView = async () => {
  if (!window.fnHasViewBeenInitialized('/preview')) {
    document.getElementById('printResumeButton').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('downloadPdfButton').addEventListener('click', async () => {
      const oResume = await fnLoadPreviewView();
      await fnDownloadResumePdf(oResume);
    });

    window.fnMarkViewInitialized('/preview');
  }

  await fnLoadPreviewView();
};
