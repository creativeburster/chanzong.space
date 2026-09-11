import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, type, message } = body;

    // 参数校验
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: '请提供您的称呼' }, { status: 400 });
    }
    if (!contact || typeof contact !== 'string' || !contact.trim()) {
      return NextResponse.json({ error: '请提供您的联系方式（邮箱或微信）' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: '留言内容不能为空' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: '留言内容超出长度限制（2000字以内）' }, { status: 400 });
    }

    const recipientEmail = process.env.CONTACT_EMAIL || '591611431@qq.com';
    const feedbackType = type || '综合留言反馈';

    // 转发给 FormSubmit API
    const response = await fetch('https://formsubmit.co/ajax/' + recipientEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://chanzong.space',
        'Origin': 'https://chanzong.space',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({
        _subject: '【禅宗知识库】来自 ' + name.trim() + ' 的留言反馈（' + feedbackType + '）',
        称呼: name.trim(),
        回复联系方式: contact.trim(),
        反馈类型: feedbackType,
        留言详情: message.trim(),
        提交时间: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        _template: 'table',
        _captcha: 'false',
      }),
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }

    const isSuccess = 
      result.success === 'true' || 
      result.success === true || 
      (result.message && typeof result.message === 'string' && (result.message.includes('Activate') || result.message.includes('success')));

    if (response.ok || isSuccess) {
      return NextResponse.json({ success: true, message: '留言已成功送达！' });
    } else {
      console.error('FormSubmit response error:', result);
      return NextResponse.json(
        { error: '邮件网关返回异常：' + (result.message || text) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: '服务暂时繁忙，请稍后重试: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
