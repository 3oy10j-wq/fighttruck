# Stripe Webhook セットアップガイド

このドキュメントでは、ローカル開発環境で Stripe Webhook をテストする方法を説明します。

## 前提条件

- Stripe CLI がインストールされていること
- Node.js/npm がインストールされていること
- 開発サーバー（Next.js）が起動していること
- Stripe テストアカウントを持っていること

## Stripe CLI インストール確認

```bash
stripe --version
```

## セットアップ手順

### 1. Stripe アカウント認証

```bash
stripe login
```

このコマンドを実行すると、ブラウザが開き、Stripe Dashboard での認証を求めます。認証後、ローカルマシンが API キーを取得します。

### 2. Webhook リスニングスタート

別のターミナルウィンドウで以下を実行します：

```bash
stripe listen --forward-to http://localhost:3009/api/stripe-webhook
```

**ポート注意**：開発サーバーが 3009 で起動している場合は上のコマンドを使用してください。
別のポートの場合は、ポート番号を置き換えてください。

出力例：
```
> Ready! You are now listening for Stripe webhooks...
> Your webhook signing secret is: whsec_1234567890abcdef...
```

### 3. Webhook Secret を環境変数に設定

上記のコマンドで表示された `whsec_...` をコピーして、`.env.local` に設定します：

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

設定後、開発サーバーを再起動してください。

### 4. テスト決済フロー

#### 4.1 テストカード情報

Stripe Checkout でテスト決済を行う場合、以下のテストカード番号を使用してください：

- **成功するテスト決済**:
  - カード番号: `4242 4242 4242 4242`
  - 有効期限: `12/25` (任意の未来日付)
  - CVC: `123` (任意の3桁)

- **カード認証が必要なテスト**:
  - カード番号: `4000 0027 6000 3184`
  - 有効期限: `12/25`
  - CVC: `123`

#### 4.2 決済テストの実行

1. マイページ (`http://localhost:3009/mypage`) にアクセス
2. 「⭐ プランをアップグレード (¥500/月)」をクリック
3. Stripe Checkout 画面でテストカード情報を入力
4. 「購入」をクリック

#### 4.3 Webhook の動作確認

Webhook リスニングしているターミナルで、以下のようなメッセージが表示されます：

```
2024-12-01 10:30:45 --> checkout.session.completed
2024-12-01 10:30:45 --> charge.succeeded
2024-12-01 10:30:45 --> customer.subscription.created
2024-12-01 10:30:45 --> payment_intent.succeeded
```

### 5. Firestore でデータを確認

Firebase Console にアクセスして、以下を確認します：

1. `users` コレクション内の該当ユーザードキュメント
2. 以下のフィールドが設定されていることを確認：
   - `isPremium: true`
   - `stripeCustomerId: cus_...`
   - `stripeSubscriptionId: sub_...`
   - `subscriptionStatus: "active"`
   - `subscriptionUpdatedAt: 2024-12-01T10:30:45Z`

## トラブルシューティング

### Webhook Secret が正しくない場合

```
❌ Webhook signature verification failed
```

この場合、`.env.local` の `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認してください。

### localhost へのリダイレクトが失敗する場合

`.env.local` の `NEXT_PUBLIC_APP_URL` が正しいポート番号を指していることを確認：

```
NEXT_PUBLIC_APP_URL=http://localhost:3009
```

### Webhook イベントを手動で送信する場合

```bash
stripe trigger payment_intent.succeeded
```

## 本番環境へのデプロイ

本番環境では以下の設定が必要です：

1. **Stripe Dashboard** → Settings → Webhooks
2. **Endpoint URL** に本番サーバーの URL を設定：
   ```
   https://yourdomain.com/api/stripe-webhook
   ```
3. リッスンするイベント：
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

4. 本番環境の `.env` に Webhook Secret を設定

---

## 参考資料

- [Stripe CLI 公式ドキュメント](https://stripe.com/docs/stripe-cli)
- [Stripe Webhook ドキュメント](https://stripe.com/docs/webhooks)
- [Stripe テストカード](https://stripe.com/docs/testing)
