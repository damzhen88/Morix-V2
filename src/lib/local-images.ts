/**
 * MORIX V2 — รูปภาพบนเครื่อง (IndexedDB)
 *
 * รูปไม่เก็บใน localStorage เพราะเพดาน ~5MB รูปสลิปเดียวก็เกือบเต็ม
 * IndexedDB เก็บ Blob ได้ตรงๆ และมีโควตาตามพื้นที่ดิสก์
 *
 * รูปทุกใบถูกย่อและบีบอัดก่อนเก็บ — สลิปโอนเงินไม่ต้องความละเอียดสูง
 * และผู้ใช้ถ่ายจากมือถือซึ่งได้ไฟล์ 3-5MB ต่อใบ
 */

const DB_NAME = 'morix-images';
const DB_VERSION = 1;
const STORE = 'images';

/** ประเภทเจ้าของรูป — ใช้ประกอบเป็น key เพื่อไม่ให้ id ชนกันข้ามโดเมน */
export type ImageOwner = 'slip' | 'product';

export function imageKey(owner: ImageOwner, ownerId: string, suffix = ''): string {
  return suffix ? `${owner}:${ownerId}:${suffix}` : `${owner}:${ownerId}`;
}

// ─────────────────────────────────────────
// เปิดฐานข้อมูล
// ─────────────────────────────────────────

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!hasIndexedDB()) {
    return Promise.reject(new Error('เบราว์เซอร์นี้ไม่รองรับการเก็บรูปบนเครื่อง'));
  }

  // แคช promise ไว้ เพราะทุกการอ่าน/เขียนเรียกผ่านนี่
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('เปิดฐานข้อมูลรูปไม่สำเร็จ'));
  });

  // ถ้าเปิดไม่สำเร็จ ให้ครั้งถัดไปลองใหม่ได้ ไม่ค้าง promise ที่ reject ไว้ตลอด
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const req = run(transaction.objectStore(STORE));

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('อ่าน/เขียนรูปไม่สำเร็จ'));
      })
  );
}

// ─────────────────────────────────────────
// ย่อและบีบอัด
// ─────────────────────────────────────────

export interface CompressOptions {
  /** ด้านที่ยาวที่สุดหลังย่อ (px) */
  maxPx?: number;
  /** คุณภาพ JPEG 0-1 */
  quality?: number;
}

/**
 * ย่อรูปให้ด้านยาวไม่เกิน maxPx แล้วบีบเป็น JPEG
 *
 * สลิปจากมือถือมักได้ไฟล์ 3-5MB ย่อเหลือ 1200px คุณภาพ 0.72
 * ได้ราว 100-200KB ซึ่งยังอ่านตัวเลขในสลิปได้ชัด
 */
export async function compressImage(
  file: File | Blob,
  { maxPx = 1200, quality = 0.72 }: CompressOptions = {}
): Promise<Blob> {
  // ไฟล์ที่ไม่ใช่รูป (เช่น PDF) บีบไม่ได้ เก็บตามเดิม
  if (file.type && !file.type.startsWith('image/')) return file;

  const bitmap = await loadBitmap(file);

  const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  // สลิปมักมีพื้นขาว ถ้าต้นฉบับเป็น PNG โปร่งใสจะกลายเป็นดำเมื่อแปลงเป็น JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );

  // ถ้าบีบแล้วใหญ่กว่าเดิม (รูปเล็กมากอยู่แล้ว) ใช้ต้นฉบับ
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

async function loadBitmap(file: File | Blob): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap เร็วกว่าและไม่ต้องรอ onload — Safari iOS รองรับตั้งแต่ 15
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* ตกไปใช้ <img> */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('อ่านไฟล์รูปไม่สำเร็จ'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ─────────────────────────────────────────
// อ่าน / เขียน / ลบ
// ─────────────────────────────────────────

export async function putImage(key: string, blob: Blob): Promise<void> {
  await tx('readwrite', store => store.put(blob, key));
}

/** ย่อ+บีบก่อนเก็บ คืนขนาดที่เก็บจริงเพื่อเอาไปแสดงได้ */
export async function saveImage(
  key: string,
  file: File | Blob,
  options?: CompressOptions
): Promise<{ bytes: number }> {
  const compressed = await compressImage(file, options);
  await putImage(key, compressed);
  return { bytes: compressed.size };
}

export async function getImageBlob(key: string): Promise<Blob | null> {
  try {
    const result = await tx<Blob | undefined>('readonly', store => store.get(key));
    return result ?? null;
  } catch {
    return null;
  }
}

/**
 * คืน object URL ของรูป
 *
 * ผู้เรียกต้อง revoke เองเมื่อเลิกใช้ ไม่งั้น memory leak
 * ในคอมโพเนนต์ให้ใช้ hook useLocalImage ที่ cleanup ให้แล้ว
 */
export async function getImageUrl(key: string): Promise<string | null> {
  const blob = await getImageBlob(key);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteImage(key: string): Promise<void> {
  try {
    await tx('readwrite', store => store.delete(key));
  } catch {
    // ลบรูปไม่สำเร็จไม่ควรทำให้การลบข้อมูลหลักล้มเหลว
  }
}

export async function hasImage(key: string): Promise<boolean> {
  return (await getImageBlob(key)) !== null;
}

/** ลบรูปทั้งหมด — ใช้ตอนล้างข้อมูลเริ่มใหม่ */
export async function clearImages(): Promise<void> {
  try {
    await tx('readwrite', store => store.clear());
  } catch {
    /* ไม่เป็นไร */
  }
}

/** พื้นที่ที่รูปใช้รวม — ใช้แสดงในหน้าจัดการข้อมูล */
export async function estimateImageBytes(): Promise<number> {
  try {
    const db = await openDb();
    return await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly');
      const req = transaction.objectStore(STORE).openCursor();
      let total = 0;

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const value = cursor.value as Blob;
          total += value?.size ?? 0;
          cursor.continue();
        } else {
          resolve(total);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}
