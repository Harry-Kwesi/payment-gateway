var stripe = Stripe("pk_test_5...");

var form = document.getElementById("payment-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var amount = 1099;

  // Fetch client secret from server-side '/secret' endpoint
  fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json", // Specify that the client expects JSON response
      "User-Agent": "app",
    },
    body: JSON.stringify({
      payment_method_types: ["card", "paynow"],
      payment_method_data: {
        type: "paynow",
      },
      amount: amount,
      currency: "sgd",
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var clientSecret = data.client_secret;
      console.log("clientsecret", clientSecret);
      // Check if clientSecret is defined before using it
      if (clientSecret) {
        stripe
          .confirmPayNowPayment(clientSecret)
          .then((result) => {
            if (result.error) {
              console.error("Error:", result.error.message);
              // Handle payment error
            } else {
              // Payment successful
              if (result.paymentIntent.status === "succeeded") {
                // The user scanned the QR code and payment succeeded
                console.log("Payment succeeded!");
              } else {
                // Payment status is neither succeeded nor failed
                console.error(
                  "Unexpected payment status:",
                  result.paymentIntent.status
                );
              }
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            // Handle error
          });
      } else {
        console.error("Client secret is not defined");
        // Handle the case where clientSecret is not defined
      }
    })
    .catch(function (error) {
      console.error("Error fetching client secret:", error);
      // Handle error
    });
});
