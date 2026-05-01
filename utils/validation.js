const fnCreateError = (nStatusCode, cMessage, aDetails = []) => {
  const cError = new Error(cMessage);
  cError.statusCode = nStatusCode;
  cError.details = aDetails;
  return cError;
};

const fnRequireString = (vValue, cFieldLabel) => {
  if (typeof vValue !== 'string' || vValue.trim() === '') {
    throw fnCreateError(400, `${cFieldLabel} is required.`);
  }

  return vValue.trim();
};

const fnOptionalString = (vValue) => {
  if (typeof vValue !== 'string') {
    return '';
  }

  return vValue.trim();
};

const fnRequireArray = (vValue, cFieldLabel) => {
  if (!Array.isArray(vValue)) {
    throw fnCreateError(400, `${cFieldLabel} must be an array.`);
  }

  return vValue;
};

const fnParseIdArray = (vValue) => {
  if (!vValue) {
    return [];
  }

  return String(vValue)
    .split(',')
    .map((cItem) => Number(cItem))
    .filter((nItem) => Number.isInteger(nItem) && nItem > 0);
};

const fnRequirePositiveInteger = (vValue, cFieldLabel) => {
  const nValue = Number(vValue);

  if (!Number.isInteger(nValue) || nValue <= 0) {
    throw fnCreateError(400, `${cFieldLabel} must be a positive integer.`);
  }

  return nValue;
};

module.exports = {
  fnCreateError,
  fnRequireString,
  fnOptionalString,
  fnRequireArray,
  fnParseIdArray,
  fnRequirePositiveInteger
};
