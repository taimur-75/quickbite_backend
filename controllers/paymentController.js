const Order = require('../models/Order');
const Stripe = require('stripe');

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












// Initialize Stripe instance (ensures STRIPE_SECRET_KEY is in your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Creates a Stripe Checkout Session ID and returns it to the client.
 * @route POST /api/payments/create-checkout-session (via paymentRoutes)
 * @access Private/Protected
 */


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


