'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/local-images';

/**
 * โหลดรูปจาก IndexedDB มาแสดง
 *
 * object URL ต้อง revoke เมื่อเลิกใช้ ไม่งั้นรูปค้างในหน่วยความจำทั้ง session
 * hook นี้จัดการให้ — อย่าเรียก getImageUrl ตรงๆ ในคอมโพเนนต์
 */
export function useLocalImage(key: string | null | undefined): {
  url: string | null;
  loading: boolean;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(key));

  useEffect(() => {
    if (!key) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let revoked = false;
    let current: string | null = null;
    setLoading(true);

    getImageUrl(key)
      .then(next => {
        // คอมโพเนนต์อาจ unmount หรือเปลี่ยน key ไปแล้วระหว่างรอ
        if (revoked) {
          if (next) URL.revokeObjectURL(next);
          return;
        }
        current = next;
        setUrl(next);
      })
      .catch(() => {
        if (!revoked) setUrl(null);
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (current) URL.revokeObjectURL(current);
    };
  }, [key]);

  return { url, loading };
}
