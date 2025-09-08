import type { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN!; // http://localhost:3000

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 보안: 허용 경로 화이트리스트 (SSR 같은 내부 프린트용 페이지만 허용)
  const rawPath = (req.query.path as string) || '/pdf/receipt';
  const allowed = ['/pdf/receipt']; // 필요 시 확장
  if (!allowed.includes(rawPath)) {
    res.status(400).json({ code: 'E400', message: '허용되지 않은 path' });
    return;
  }

  const targetUrl = new URL(rawPath, SITE_ORIGIN).toString();

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox'], // Docker/컨테이너 환경에서 권장
    });

    const context = await browser.newContext({
      // 배경 제거/경량화는 PDF 옵션에서 처리
      viewport: { width: 800, height: 1120 }, // A4 비율에 근접한 뷰포트
    });

    // 인증이 필요한 페이지라면, API 요청의 Cookie를 Playwright 컨텍스트로 전달
    const cookieHeader = req.headers.cookie || '';
    if (cookieHeader) {
      await context.addCookies(
        cookieHeader.split(';').map((c) => {
          const [name, ...rest] = c.trim().split('=');
          const value = rest.join('=');
          return {
            name,
            value,
            domain: new URL(SITE_ORIGIN).hostname,
            path: '/',
            httpOnly: false,
            secure: SITE_ORIGIN.startsWith('https'),
          } as const;
        })
      );
    }

    const page = await context.newPage();

    // 인쇄 미디어 기준 스타일로 렌더
    await page.emulateMedia({ media: 'print' });

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30_000 });

    // 핵심: 용량 줄이는 옵션 (printBackground=false, preferCSSPageSize=true 등)
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    // inline 미리보기: attachment 대신 inline
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.status(200).send(pdf);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ code: 'E500', message: 'PDF 생성 실패' });
  } finally {
    await browser?.close();
  }
}
