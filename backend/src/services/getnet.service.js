async function createGetnetSession(order, req) {
  console.log("LINK GETNET:", process.env.GETNET_PAYMENT_LINK);

  return {
    requestId: `LINK-${Date.now()}`,
    processUrl: process.env.GETNET_PAYMENT_LINK,
  };
}

async function getGetnetSession(requestId) {
  return {
    requestId,
    status: {
      status: "PENDING",
    },
  };
}

module.exports = {
  createGetnetSession,
  getGetnetSession,
};