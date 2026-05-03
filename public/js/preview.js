const fnDownloadResumePdf = (oResume) => {
  const { jsPDF } = window.jspdf;
  const cPdfDocument = new jsPDF();
  let nVerticalPosition = 20;
  const cContactMode = oResume.contactMode || 'email';
  const aContactParts = [];

  if ((cContactMode === 'email' || cContactMode === 'both') && oResume.user?.email) {
    aContactParts.push(oResume.user.email);
  }

  if ((cContactMode === 'phone' || cContactMode === 'both') && oResume.user?.phone) {
    aContactParts.push(oResume.user.phone);
  }

  const fnEnsurePageSpace = (nRequiredHeight = 12) => {
    if (nVerticalPosition + nRequiredHeight > 280) {
      cPdfDocument.addPage();
      nVerticalPosition = 20;
    }
  };

  const fnWriteSectionTitle = (cTitle) => {
    fnEnsurePageSpace(10);
    cPdfDocument.setFont('helvetica', 'bold');
    cPdfDocument.setFontSize(14);
    cPdfDocument.text(cTitle, 14, nVerticalPosition);
    nVerticalPosition += 8;
  };

  const fnWriteWrappedText = (cText, nIndent = 14) => {
    fnEnsurePageSpace(12);
    cPdfDocument.setFont('helvetica', 'normal');
    cPdfDocument.setFontSize(11);
    const aLines = cPdfDocument.splitTextToSize(cText, 180 - nIndent);
    fnEnsurePageSpace(aLines.length * 6);
    cPdfDocument.text(aLines, nIndent, nVerticalPosition);
    nVerticalPosition += (aLines.length * 6);
  };

  cPdfDocument.setFont('helvetica', 'bold');
  cPdfDocument.setFontSize(18);
  cPdfDocument.text(`${oResume.user?.firstName || ''} ${oResume.user?.lastName || ''}`.trim() || 'Resume', 14, nVerticalPosition);
  nVerticalPosition += 10;
  fnWriteWrappedText(aContactParts.join(' | ') || oResume.user?.email || oResume.user?.phone || '');
  nVerticalPosition += 2;
  cPdfDocument.setFont('helvetica', 'bold');
  cPdfDocument.setFontSize(14);
  cPdfDocument.text(oResume.profile?.targetRole || 'Professional Resume', 14, nVerticalPosition);
  nVerticalPosition += 8;

  fnWriteWrappedText(oResume.profile?.professionalSummary || '');
  nVerticalPosition += 4;

  if (oResume.jobs.length > 0) {
    fnWriteSectionTitle('Professional Experience');
    oResume.jobs.forEach((oJob) => {
      fnWriteWrappedText(`${oJob.title} | ${oJob.company} | ${fnFormatMonth(oJob.startDate)} - ${fnFormatMonth(oJob.endDate)}`);
      oJob.responsibilities.forEach((oResponsibility) => {
        fnWriteWrappedText(`- ${oResponsibility.description}`, 20);
      });
      nVerticalPosition += 4;
    });
  }

  if (Object.keys(oResume.skillsByCategory).length > 0) {
    fnWriteSectionTitle('Skills');
    Object.entries(oResume.skillsByCategory).forEach(([cCategoryName, aSkills]) => {
      fnWriteWrappedText(`${cCategoryName}: ${aSkills.map((oSkill) => oSkill.skillName).join(', ')}`);
    });
  }

  if (oResume.certifications.length > 0) {
    fnWriteSectionTitle('Certifications');
    oResume.certifications.forEach((oCertification) => {
      fnWriteWrappedText(`${oCertification.certificationName} | ${oCertification.issuingOrganization}`);
    });
  }

  if (oResume.awards.length > 0) {
    fnWriteSectionTitle('Awards');
    oResume.awards.forEach((oAward) => {
      fnWriteWrappedText(`${oAward.awardName} | ${oAward.issuingOrganization}`);
    });
  }

  cPdfDocument.save('resume.pdf');
};

document.addEventListener('DOMContentLoaded', async () => {
  let oResume = null;
  const cStoredPreview = localStorage.getItem(fnGetUserScopedStorageKey('resumeBuilderPreview'));

  if (cStoredPreview) {
    oResume = JSON.parse(cStoredPreview);
  } else {
    fnLoadContactMode();
    oResume = await fnFetchResumePreview();
  }

  document.getElementById('fullResumePreview').innerHTML = fnBuildResumeMarkup(oResume);

  document.getElementById('printResumeButton').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('downloadPdfButton').addEventListener('click', () => {
    fnDownloadResumePdf(oResume);
  });
});
