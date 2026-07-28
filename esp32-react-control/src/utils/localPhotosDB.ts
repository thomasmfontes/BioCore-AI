export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  formattedDate: string;
  filename: string;
  plantName?: string;
}

const DB_NAME = 'biocore_photos_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoToLocal(photo: Omit<CapturedPhoto, 'id'>): Promise<CapturedPhoto> {
  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const photoRecord: CapturedPhoto = {
    ...photo,
    id,
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(photoRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return photoRecord;
  } catch (error) {
    console.warn('Erro ao salvar no IndexedDB, tentando fallback localStorage:', error);
    try {
      const currentRaw = localStorage.getItem('biocore_local_photos') || '[]';
      const list: CapturedPhoto[] = JSON.parse(currentRaw);
      list.unshift(photoRecord);
      localStorage.setItem('biocore_local_photos', JSON.stringify(list.slice(0, 15)));
    } catch {
      /* ignore */
    }
    return photoRecord;
  }
}

export async function getLocalPhotos(): Promise<CapturedPhoto[]> {
  try {
    const db = await openDB();
    return await new Promise<CapturedPhoto[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: CapturedPhoto[] = req.result || [];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Erro ao ler do IndexedDB, usando fallback:', error);
    try {
      const currentRaw = localStorage.getItem('biocore_local_photos') || '[]';
      return JSON.parse(currentRaw);
    } catch {
      return [];
    }
  }
}

export async function deleteLocalPhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Erro ao excluir do IndexedDB:', error);
    try {
      const currentRaw = localStorage.getItem('biocore_local_photos') || '[]';
      let list: CapturedPhoto[] = JSON.parse(currentRaw);
      list = list.filter(p => p.id !== id);
      localStorage.setItem('biocore_local_photos', JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
}

export function triggerDeviceDownload(dataUrl: string, filename: string) {
  if (!dataUrl || (!dataUrl.startsWith('data:') && !dataUrl.startsWith('blob:'))) {
    console.warn('triggerDeviceDownload cancelado para evitar navegação:', dataUrl);
    return;
  }
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function sharePhotoFile(dataUrl: string, filename: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Foto BioCore AI',
        text: 'Registro da câmera da minha planta via BioCore AI',
      });
      return true;
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.warn('Erro ao compartilhar foto:', err);
    }
  }
  return false;
}
