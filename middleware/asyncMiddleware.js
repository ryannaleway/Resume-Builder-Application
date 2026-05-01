const fnAsyncHandler = (fnHandler) => {
  return async (cRequest, cResponse, cNext) => {
    try {
      await fnHandler(cRequest, cResponse, cNext);
    } catch (cError) {
      cNext(cError);
    }
  };
};

module.exports = {
  fnAsyncHandler
};
