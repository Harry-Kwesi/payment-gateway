    How to run locally.

1. Rename and move the .env.example file into a file named .env in the specific folder of the server language you want to use. 

Example .env file:

STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
STRIPE_WEBHOOK_SECRET=<replace-with-your-webhook-secret-key>


You will need a Stripe account in order to run the demo. Once you set up your account, go to the Stripe developer dashboard to find your API keys.

2. Run the server 
npm install
npm start

3. Run a webhook locally
You can use tools like ngrok or 
install the CLI and link your Stripe account.
stripe listen --forward-to localhost:4242/webhook

4. Set up your database
You can use firebase or firestore
Get the Json from firebase and save it as json 
