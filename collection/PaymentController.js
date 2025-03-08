const {
    PaymentHandler,
    APIException,
    validateHMAC_SHA256,
  } = require("./PaymentHandler");
  const crypto = require("crypto");
  const multer = require('multer')

  const upload = multer(); // Middleware for parsing FormData

  

const InitiatePayment = async (req, res) => {
  await new Promise((resolve) => upload.any()(req, res, resolve)); // Parse FormData

    const orderId = `order_${Date.now()}`;
    const amount = req.body.amount;
    const returnUrl = `https://lovefools-user-panel.vercel.app/booking`;
    const paymentHandler = PaymentHandler.getInstance();
    try {
      const orderSessionResp = await paymentHandler.orderSession({
        order_id: orderId,
        amount,
        currency: "INR",
        return_url: returnUrl,
        // [MERCHANT_TODO]:- please handle customer_id, it's an optional field but we suggest to use it.
        customer_id: "sample-customer-id",
        // please note you don't have to give payment_page_client_id here, it's mandatory but
        // PaymentHandler will read it from config.json file
        // payment_page_client_id: paymentHandler.getPaymentPageClientId()
      });
      res.status(200).json({
        StatusCode: 200,
        redict_url: orderSessionResp.payment_links.web,
        
      });
      // return res.redirect(orderSessionResp.payment_links.web);
    } catch (error) {
      // [MERCHANT_TODO]:- please handle errors
      if (error instanceof APIException) {
        return res.send("PaymentHandler threw some error");
      }
      // [MERCHANT_TODO]:- please handle errors
      return res.send("Something went wrong");
    }
}

const HandlePaymentresponse = async(req, res) => {
    const orderId = req.body.order_id || req.body.orderId;
    const paymentHandler = PaymentHandler.getInstance();
  
    if (orderId === undefined) {
      return res.send("Something went wrong");
    }
  
    try {
      const orderStatusResp = await paymentHandler.orderStatus(orderId);
      if (
        validateHMAC_SHA256(req.body, paymentHandler.getResponseKey()) === false
      ) {
        // [MERCHANT_TODO]:- validation failed, it's critical error
        return window.location.href = "https://lovefools-user-panel.vercel.app/booking"
      //  return res.sendFile(path.join(__dirname, "index.html"))
        // return res.redirect("/payment-failed")
      }
  
      const orderStatus = orderStatusResp.status;
      let message = "";
      switch (orderStatus) {
        case "CHARGED":
          message = "order payment done successfully";
          break;
        case "PENDING":
        case "PENDING_VBV":
          message = "order payment pending";
          break;
        case "AUTHORIZATION_FAILED":
          message = "order payment authorization failed";
          break;
        case "AUTHENTICATION_FAILED":
          message = "order payment authentication failed";
          break;
        default:
          message = "order status " + orderStatus;
          break;
      }
  
      const html = makeOrderStatusResponse(
        "Merchant Payment Response Page",
        message,
        req,
        orderStatusResp
      );
      res.set("Content-Type", "text/html");
      return res.send(html);
    } catch (error) {
      console.error(error);
      // [MERCHANT_TODO]:- please handle errors
      if (error instanceof APIException) {
        return res.send("PaymentHandler threw some error");
      }
      // [MERCHANT_TODO]:- please handle errors
      return res.send("Something went wrong");
    }
}

const InitiatePaymentRefund = async () => {
    const paymentHandler = PaymentHandler.getInstance();
  
    try {
      const refundResp = await paymentHandler.refund({
        order_id: req.body.order_id,
        amount: req.body.amount,
        unique_request_id: req.body.unique_request_id || `refund_${Date.now()}`,
      });
      const html = makeOrderStatusResponse(
        "Merchant Refund Page",
        `Refund status:- ${refundResp.status}`,
        req,
        refundResp
      );
      res.set("Content-Type", "text/html");
      return res.send(html);
    } catch (error) {
      console.error(error);
      // [MERCHANT_TODO]:- please handle errors
      if (error instanceof APIException) {
        return res.send("PaymentHandler threw some error");
      }
      // [MERCHANT_TODO]:- please handle errors
      return res.send("Something went wrong");
    }
}

  // [MERCHAT_TODO]:- Please modify this as per your requirements
  const makeOrderStatusResponse = (title, message, req, response) => {
    let inputParamsTableRows = "";
    for (const [key, value] of Object.entries(req.body)) {
      const pvalue = value !== null ? JSON.stringify(value) : "";
      inputParamsTableRows += `<tr><td>${key}</td><td>${pvalue}</td></tr>`;
    }
  
    let orderTableRows = "";
    for (const [key, value] of Object.entries(response)) {
      const pvalue = value !== null ? JSON.stringify(value) : "";
      orderTableRows += `<tr><td>${key}</td><td>${pvalue}</td></tr>`;
    }
  
    return `
          <html>
          <head>
              <title>${title}</title>
          </head>
          <body>
              <h1>${message}</h1>
  
              <center>
                  <font size="4" color="blue"><b>Return url request body params</b></font>
                  <table border="1">
                      ${inputParamsTableRows}
                  </table>
              </center>
  
              <center>
                  <font size="4" color="blue"><b>Response received from order status payment server call</b></font>
                  <table border="1">
                      ${orderTableRows}
                  </table>
              </center>
          </body>
          </html>
      `;
  };


  module.exports = {
    InitiatePayment,
    InitiatePaymentRefund,
    HandlePaymentresponse,
  };