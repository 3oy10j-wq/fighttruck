import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mypage?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mypage?subscription=canceled`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('❌ Checkout Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
