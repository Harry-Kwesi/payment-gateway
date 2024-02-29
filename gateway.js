const express = require("express");
const app = express();
const path = require("path");
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const serviceAccount = require("./payment-gateway-bbba7-firebase-adminsdk-h6t4y-a5767fa3de.json");

const port = process.env.PORT || 8000;

// Initialize Firebase Admin SDK for Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(express.static(path.join(__dirname, "views")));
app.use((req, res, next) => {
  // We need the raw body to verify webhook signatures.
  // Check if the request is for the '/webhook' endpoint
  if (req.originalUrl === "/webhook") {
    // Continue to the next middleware or route handler
    next();
  } else {
    // If not a '/webhook' request, use the express.json() middleware
    express.json()(req, res, next);
  }
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ["card", "paynow"],
      payment_method_data: {
        type: "paynow",
      },
      amount: amount,
      currency: "sgd",
    });
    // Send the PaymentIntent client secret and a message back to the client as a response
    res.json({
      client_secret: paymentIntent.client_secret,
      message: "PaymentIntent created successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create PaymentIntent" });
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let data, eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      data = event.data;
      eventType = event.type;
    } else {
      data = req.body.data;
      eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      const session = data.object;
      updateFirestore(session);
      console.log("💰 Payment captured!");
    } else if (eventType === "payment_intent.payment_failed") {
      console.log("❌ Payment failed.");
    }
    res.sendStatus(200);
  }
);

// Function to update Firestore with successful payment information
async function updateFirestore(session) {
  const { amount_received, status } = session;
  try {
    await db.collection("payments").add({
      amount: amount_received,
      payment_status: status,
    });
    console.log("Firestore updated with payment information");
  } catch (error) {
    console.error("Error updating Firestore:", error);
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
