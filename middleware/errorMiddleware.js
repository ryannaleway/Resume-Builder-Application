const fnHandleError = (cError, cRequest, cResponse, cNext) => {
  const nStatusCode = cError.statusCode || 500;

  cResponse.status(nStatusCode).json({
    message: cError.message || 'An unexpected server error occurred.',
    details: cError.details || []
  });
};

module.exports = {
  fnHandleError
};
