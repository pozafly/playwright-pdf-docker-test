// pages/pdf/preview.tsx
import React from 'react';

export default function PdfPreview() {
  const [url, setUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let objectUrl = '';
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pdf?path=/pdf/receipt');
        if (!res.ok) throw new Error('PDF 생성 실패');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>PDF 미리보기</h1>
      {loading && <p>생성 중…</p>}
      {!loading && url && (
        <>
          <div
            style={{
              height: '90vh',
              border: '1px solid #ddd',
              marginBottom: 12,
            }}
          >
            <iframe
              title="pdf"
              src={url}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <a href={url} download="document.pdf">
            PDF 다운로드
          </a>
        </>
      )}
    </main>
  );
}
