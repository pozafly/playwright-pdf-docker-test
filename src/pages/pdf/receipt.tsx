import React from 'react';

// 인쇄 미디어 최적화: 배경 제거, 간결한 레이아웃, 시스템 폰트 사용
const styles = `
  @page { margin: 12mm; }
  @media print {
    body { -webkit-print-color-adjust: economy; print-color-adjust: economy; }
  }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans', sans-serif;
    line-height: 1.4;
  }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .section { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border-bottom: 1px solid #ddd; text-align: left; padding: 6px 4px; font-size: 12px;}
`;

export default function ReceiptPage() {
  // 서버 인증이 필요한 경우엔 쿠키 기반으로 해당 페이지에서도 보호 가능
  const items = [
    { name: '서비스 A', qty: 1, price: 9900 },
    { name: '서비스 B', qty: 2, price: 4500 },
  ];
  const total = items.reduce((acc, x) => acc + x.qty * x.price, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <h1>영수증</h1>
      <div className="section">
        발행일: {new Date().toLocaleDateString('ko-KR')}
      </div>

      <div className="section">
        <table>
          <thead>
            <tr>
              <th>품목</th>
              <th>수량</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.qty}</td>
                <td>{(it.qty * it.price).toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>합계</th>
              <th>{total.toLocaleString()}원</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
