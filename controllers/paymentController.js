const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//----------------------------------------------------------------------------------------
// Simulated Payment Handler
/*const makePayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ msg: 'Order already paid' });
    }

    // Simulate payment success
    order.paymentStatus = 'Paid';
    order.paymentId = `PAY-${Math.random().toString(36).substring(2, 12)}`;
    order.paidAt = new Date();
    order.status = 'Confirmed'; // Optionally auto-confirm the order

    await order.save();

    res.status(200).json({ msg: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};*/
//--------------------------------------------------------------------------------------------



// --- Placeholder for Checkout Session Creation ---
// You will need to ensure this function correctly includes the orderId 
// in the session metadata, e.g., metadata: { orderId: newOrder._id.toString() }
exports.createCheckoutSession = async (req, res) => {
    // ... Your existing logic for creating a Stripe checkout session ...
    // NOTE: Ensure you add metadata: { orderId: order._id.toString() } here!
    res.status(501).json({ message: "Checkout session creation logic not implemented here for brevity." });
};

// --- Webhook Handler with Comprehensive Error Logging ---
exports.handleStripeWebhook = async (req, res) => {
    // 1. Initialize variables and log reception
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    console.log(`\n--- Webhook received at ${new Date().toISOString()} ---`);
    console.log(`Event signature: ${sig.substring(0, 30)}...`);
    
    let event;
    
    // 2. CRITICAL STEP: Signature Verification
    try {
        // req.body MUST be the raw buffer here
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log(`✅ Webhook Signature Verified for event ID: ${event.id}`);
    } catch (err) {
        // If verification fails, log the specific error and return 400 immediately.
        console.error(`❌ CRITICAL FAILURE: Webhook signature verification failed:`, err.message);
        // This is where a STRIPE_WEBHOOK_SECRET mismatch causes failure.
        return res.status(400).send(`Webhook Error: Signature verification failed: ${err.message}`);
    }

    const session = event.data.object;
    
    // 3. Handle specific event types (Fulfillment Logic)
    switch (event.type) {
        case 'checkout.session.completed':
            console.log(`Handling Event Type: ${event.type}. Session ID: ${session.id}`);

            // 3a. Metadata Check
            const orderId = session.metadata?.orderId;
            if (!orderId) {
                console.error("❌ Fulfillment Error: Missing 'orderId' in session metadata. Cannot process.");
                // Return 200, as the event is fine, but our application data is unusable.
                return res.status(200).json({ received: true, message: "Missing Order ID in metadata." });
            }
            console.log(`Attempting to update Order ID: ${orderId}`);

            if (session.payment_status !== 'paid') {
                console.warn(`⚠️ Warning: Session status is '${session.payment_status}'. Expected 'paid'. Skipping update.`);
                // Still acknowledge the event, we only care about 'paid' status.
                return res.status(200).json({ received: true });
            }

            // 3b. Database Update (Atomic Operation)
            try {
                // Use findByIdAndUpdate for atomic and simpler update logic
                const updatedOrder = await Order.findByIdAndUpdate(
                    orderId,
                    { 
                        paymentStatus: 'Paid',
                        paymentId: session.payment_intent, 
                        paidAt: new Date(),
                        status: 'Confirmed', 
                    },
                    { new: true, runValidators: true } // Return the updated document, run Mongoose validators
                );

                if (updatedOrder) {
                    console.log(`✅ DB Success: Order ${orderId} status updated to Paid/Confirmed.`);
                } else {
                    console.error(`❌ DB Error: Order with ID ${orderId} not found in database for update. (Might have been deleted or wrong ID)`);
                }

            } catch (dbError) {
                // Log detailed database error (e.g., Mongoose validation failure)
                console.error(`❌ DB Fulfillment Error (Order ${orderId}):`, dbError.message);
                // IMPORTANT: Do NOT return 500. Log the failure internally, but tell Stripe we received it (200) 
                // to prevent it from retrying the event infinitely.
            }
            break;

        default:
            // Log any other received events for visibility
            console.log(`⚠️ Unhandled event type received: ${event.type}`);
    }

    // 4. Acknowledge Receipt (Final Step)
    // Always return 200 to Stripe to prevent retries, unless the signature verification failed (Step 2).
    res.status(200).json({ received: true });
    console.log(`--- Webhook processing finished. Response sent: 200 OK ---\n`);
};

const createCheckoutSession = async (req, res) => {
    const { orderId } = req.body; 
    const userId = req.user.id; 

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    try {
        const order = await Order.findById(orderId).populate('items.dish');
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Map order items to Stripe line items
        const lineItems = order.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.dish.name },
                unit_amount: Math.round(item.dish.price * 100), // Price in cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            metadata: { 
                orderId: order._id.toString(),
                userId: userId
            }, 
            success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/payment-cancel?order_id=${orderId}`, 
            customer_email: req.user.email,
        });

        res.status(200).json(session);

    } catch (err) {
        console.error("Stripe Checkout Session Creation Error:", err);
        res.status(500).json({ msg: 'Failed to create Stripe Checkout session', error: err.message });
    }
};

/**
 * @desc Handles incoming Stripe events for fulfillment.
 * @route POST /api/payments/webhook (via server.js and paymentRoutes)
 * @access Public
 */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // NOTE: req.body here is the RAW body buffer because it came through bodyParser.raw()

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.sendStatus(400);
    }

    // Fulfillment logic
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        try {
            const order = await Order.findById(orderId);
            if (!order) {
                console.log(`Webhook Error: Order ${orderId} not found.`);
                return res.sendStatus(404);
            }

            if (session.payment_status === 'paid' && order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Paid';
                order.paymentId = session.payment_intent; 
                order.paidAt = new Date();
                order.status = 'Confirmed'; 
                
                await order.save();
                console.log(`✅ Order ${orderId} successfully processed.`);
            }

        } catch (error) {
            console.error('Webhook Fulfillment DB Error:', error);
            return res.status(500).json({ received: false, error: error.message });
        }
    }

    res.sendStatus(200);
};

module.exports = { 
    createCheckoutSession, 
    handleStripeWebhook 
};


