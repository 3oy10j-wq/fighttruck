import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (stripe) return stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  stripe = new Stripe(secretKey);
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await getStripe().checkout.sessions.create({
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
