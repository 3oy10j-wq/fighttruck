// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

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

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }
  return secret;
}

// Firebase Admin SDK 初期化（遅延初期化）
let db: any = null;

function getFirebaseDb() {
  if (db) return db;

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    // @ts-ignore
    const adminApp = admin.initializeApp({
      // @ts-ignore
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    db = admin.firestore(adminApp);
    return db;
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      db = admin.firestore();
      return db;
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('✓ Webhook event received:', event.type);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const email = session.customer_email;

      if (!userId || !email) {
        console.warn('⚠️ Missing userId or email in checkout session');
        return NextResponse.json({ received: true });
      }

      // Retrieve full subscription details
      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );

      const stripeCustomerId = subscription.customer as string;
      const stripeSubscriptionId = subscription.id;

      console.log('✓ checkout.session.completed:', {
        userId,
        email,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      // Update Firestore directly with Admin SDK
      try {
        await getFirebaseDb().collection('users').doc(userId).update({
          isPremium: true,
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionStatus: 'active',
          subscriptionUpdatedAt: admin.firestore.Timestamp.now(),
        });
        console.log('✓ Firestore updated:', userId);
      } catch (error) {
        console.error('❌ Firestore update error:', error);
        throw error;
      }
    }

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;

      console.log('✓ customer.subscription.deleted:', { stripeCustomerId });

      // Find user by stripeCustomerId and cancel subscription
      try {
        const usersQuery = await getFirebaseDb()
          .collection('users')
          .where('stripeCustomerId', '==', stripeCustomerId)
          .get();

        for (const userDoc of usersQuery.docs) {
          await userDoc.ref.update({
            isPremium: false,
            subscriptionStatus: 'canceled',
            subscriptionUpdatedAt: admin.firestore.Timestamp.now(),
          });
          console.log('✓ Subscription canceled:', userDoc.id);
        }
      } catch (error) {
        console.error('❌ Subscription cancellation error:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
