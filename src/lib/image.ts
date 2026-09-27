/**
 * Photo handling. Images stay in memory on the device in demo mode and are
 * never stored. They are downscaled before any (live-mode) upload to limit
 * data sent and strip most metadata (canvas re-encode drops EXIF, incl. GPS).
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1024;

export type ImageError = 'not_image' | 'too_large' | 'unreadable';

export function validateImage(file: File): ImageError | null {
  if (!file.type.startsWith('image/')) return 'not_image';
  if (file.size > MAX_IMAGE_BYTES) return 'too_large';
  return null;
}

export async function prepareImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('unreadable'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('unreadable');
    ctx.drawImage(img, 0, 0, w, h);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.82), width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** What the user says the photo shows. Mapped to plain-language context for retrieval. */
export const IMAGE_CONTEXT_OPTIONS = [
  { value: 'a small burn on the skin', label: 'A burn', label_hi: 'जलना' },
  { value: 'a small cut or graze on the skin', label: 'A cut or scrape', label_hi: 'कट या खरोंच' },
  { value: 'an insect or mosquito bite', label: 'An insect bite or sting', label_hi: 'कीड़े का काटना' },
  { value: 'a rash or skin irritation, red spots', label: 'A rash or skin irritation', label_hi: 'दाने या जलन' },
  { value: 'a bruise or swelling after a bump', label: 'A bruise or swelling', label_hi: 'नील या सूजन' },
  { value: 'a blister', label: 'A blister', label_hi: 'छाला' },
  { value: 'a stain on clothes or fabric', label: 'A stain on clothes', label_hi: 'कपड़े पर दाग' },
  { value: 'mould or damp on a wall or clothes', label: 'Mould or damp', label_hi: 'फफूंद या सीलन' },
];
