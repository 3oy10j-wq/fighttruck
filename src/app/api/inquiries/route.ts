import { NextRequest, NextResponse } from 'next/server';
import { createInquiry } from '@/lib/firebase/inquiry-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message, userId } = body;

    // バリデーション
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // Firestoreに問い合わせを保存
    const inquiryId = await createInquiry(
      name,
      email,
      category,
      message,
      userId || null
    );

    // ✅ Firestore保存成功後、すぐにクライアントに応答を返す
    const responsePromise = NextResponse.json(
      { success: true, inquiryId },
      { status: 201 }
    );

    // メール通知はバックグラウンドで非同期実行（クライアント応答を待たない）
    // @ts-ignore - 非同期タスク、応答後に実行
    (async () => {
      try {
        // 環境変数または相対URLを使ってメール送信API呼び出し
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.VERCEL_URL || 'localhost:3000';
        const apiUrl = `${protocol}://${host}/api/send-inquiry-notification`;

        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            category,
            message,
            inquiryId,
          }),
        });
        console.log('✓ メール通知を送信しました:', inquiryId);
      } catch (emailError) {
        console.error('⚠️ メール送信エラー（問い合わせは保存されました）:', emailError);
        // メール送信失敗でもログに記録し、処理は続行
      }
    })();

    return responsePromise;
  } catch (error) {
    console.error('❌ 問い合わせAPI エラー:', error);
    return NextResponse.json(
      { error: '問い合わせの送信に失敗しました' },
      { status: 500 }
    );
  }
}
