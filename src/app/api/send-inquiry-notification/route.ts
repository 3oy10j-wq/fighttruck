import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message, inquiryId } = body;

    // 管理者メールアドレス
    const adminEmail = 'gensui1732x@gmail.com';

    // メール送信
    const result = await resend.emails.send({
      from: 'noreply@fighttruck.jp',
      to: adminEmail,
      subject: `【ファイトラック】新しい問い合わせが届きました（${category}）`,
      html: `
        <h2>新しい問い合わせが届きました</h2>
        <p><strong>送信者:</strong> ${escapeHtml(name)}</p>
        <p><strong>メールアドレス:</strong> ${escapeHtml(email)}</p>
        <p><strong>種別:</strong> ${escapeHtml(category)}</p>
        <hr />
        <p><strong>本文:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          <a href="http://localhost:3000/admin/dashboard">管理ダッシュボードで確認する</a><br />
          問い合わせID: ${inquiryId}
        </p>
      `,
    });

    if (result.error) {
      console.error('❌ Resendメール送信エラー:', result.error);
      return NextResponse.json(
        { error: 'メール送信に失敗しました' },
        { status: 500 }
      );
    }

    console.log('✓ 管理者へのメール通知を送信しました:', result.data?.id);
    return NextResponse.json(
      { success: true, messageId: result.data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ メール送信API エラー:', error);
    return NextResponse.json(
      { error: 'メール送信に失敗しました' },
      { status: 500 }
    );
  }
}

// HTMLエスケープ用ヘルパー関数
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
