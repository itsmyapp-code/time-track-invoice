const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.firestore();

// exports.createCheckoutSession = functions.https.onRequest((req, res) => {
//   cors(req, res, async () => {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: 'Email is required' });
//     try {
//       const userRef = db.collection('users').doc(email);
//       let user = (await userRef.get()).data();
//       if (!user) {
//         await userRef.set({
//           email,
//           clientCount: 0,
//           invoiceCount: 0,
//           lastInvoiceReset: new Date().toISOString(),
//           subscriptionStatus: 'free',
//           logoUrl: null,
//         });
//         user = (await userRef.get()).data();
//       }
//       let stripeCustomerId = user.stripeCustomerId;
//       if (!stripeCustomerId) {
//         const customer = await stripe.customers.create({ email });
//         stripeCustomerId = customer.id;
//         await userRef.update({ stripeCustomerId });
//       }
//       const session = await stripe.checkout.sessions.create({
//         customer: stripeCustomerId,
//         payment_method_types: ['card'],
//         line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
//         mode: 'subscription',
//         success_url: 'http://localhost:3000/success',
//         cancel_url: 'http://localhost:3000/cancel',
//       });
//       res.json({ id: session.id });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to create checkout session' });
//     }
//   });
// });

// exports.stripeWebhook = functions.https.onRequest((req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }
//   if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
//     const subscription = event.data.object;
//     const userQuery = db.collection('users').where('stripeCustomerId', '==', subscription.customer);
//     userQuery.get().then((userSnapshot) => {
//       if (!userSnapshot.empty) {
//         userSnapshot.forEach((doc) => {
//           doc.ref.update({
//             subscriptionStatus: 'premium',
//             subscriptionId: subscription.id,
//           });
//         }
//       });
//     });
//   } else if (event.type === 'customer.subscription.deleted') {
//     const subscription = event.data.object;
//     const userQuery = db.collection('users').where('stripeCustomerId', '==', subscription.customer);
//     userQuery.get().then((userSnapshot) => {
//       if (!userSnapshot.empty) {
//         userSnapshot.forEach((doc) => {
//           doc.ref.update({
//             subscriptionStatus: 'free',
//             subscriptionId: null,
//             logoUrl: null,
//           });
//         }
//       });
//     });
//   }
//   res.json({ received: true });
// });

exports.checkLimits = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    try {
      const userRef = db.collection('users').doc(email);
      const user = (await userRef.get()).data();
      if (!user) return res.status(404).json({ error: 'User not found' });
      const now = new Date();
      const lastReset = new Date(user.lastInvoiceReset);
      const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
      if (daysSinceReset >= 7) {
        await userRef.update({
          invoiceCount: 0,
          lastInvoiceReset: now.toISOString(),
        });
        user.invoiceCount = 0;
      }
      const isPremium = user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'gifted';
      res.json({
        maxClients: isPremium ? Infinity : 3,
        maxInvoicesPerWeek: isPremium ? Infinity : 2,
        currentClients: user.clientCount,
        currentInvoices: user.invoiceCount,
        subscriptionStatus: user.subscriptionStatus,
        logoUrl: user.logoUrl || null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check limits' });
    }
  });
});

exports.updateCounts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email, action, type } = req.body;
    if (!email || !action || !type) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const userRef = db.collection('users').doc(email);
      const user = (await userRef.get()).data();
      if (!user) return res.status(404).json({ error: 'User not found' });
      const updates = {};
      if (type === 'client') {
        updates.clientCount = action === 'increment' ? user.clientCount + 1 : Math.max(0, user.clientCount - 1);
      } else if (type === 'invoice') {
        updates.invoiceCount = action === 'increment' ? user.invoiceCount + 1 : Math.max(0, user.invoiceCount - 1);
      }
      await userRef.update(updates);
      res.json({ message: 'Counts updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update counts' });
    }
  });
});

exports.giftPremium = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    try {
      const userRef = db.collection('users').doc(email);
      const user = (await userRef.get()).data();
      if (!user) return res.status(404).json({ error: 'User not found' });
      await userRef.update({ subscriptionStatus: 'gifted' });
      res.json({ message: 'Premium membership gifted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to gift membership' });
    }
  });
});