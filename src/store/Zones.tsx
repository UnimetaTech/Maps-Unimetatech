import * as THREE from "three";
import { create } from "zustand";
import type { TImagen360 } from "@/components/dome";
import { imagens360 } from "@/assets/Imagens360";

// ---- Tipos ----
type TextureSet = { low: THREE.Texture[]; high: THREE.Texture[] };

type TStatesZones = {
  currentIndex: number;
  currentImg360: TImagen360 | null;
  imagens360: TImagen360[];
  maps: Record<number, TextureSet>;
  loadingHighMap: Record<number, boolean>;
  loadingLow: Record<number, boolean>;
  priorityIndex: number | null;
  backgroundStarted: boolean;
  texturesReady: boolean;
};

type TActionZones = {
  changedImagen: (index: number) => Promise<void>;
  preloadTextures: () => Promise<void>;
  priorityItem: (index: number) => Promise<void>;
  loadLowForIndex: (index: number, priority?: boolean) => Promise<void>;
  loadHighForIndex: (index: number, priority?: boolean) => Promise<void>;
  startBackgroundPreload: (opts?: { low?: number; high?: number }) => void;
};

// ---- Helpers ----
const DEFAULT_HEADERS: HeadersInit = {
  Accept: "image/webp,image/*,*/*;q=0.8",
};

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function loadTexture(url: string): Promise<THREE.Texture> {
  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  const blob = await res.blob();
  const img = await loadImage(URL.createObjectURL(blob));
  const texture = new THREE.Texture(img);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

async function loadInChunks(urls: string[], chunkSize = 12): Promise<THREE.Texture[]> {
  const result: THREE.Texture[] = [];
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const texs = await Promise.all(chunk.map(loadTexture));
    result.push(...texs);
  }
  return result;
}

// ---- Store ----
export const useZones = create<TStatesZones & TActionZones>()((set, get) => ({
  currentIndex: 0,
  currentImg360: null,
  imagens360,
  maps: {},
  loadingLow: {},
  loadingHighMap: {},
  priorityIndex: null,
  backgroundStarted: false,
  texturesReady: false,

  changedImagen: async (index) => {
    set({ currentIndex: index, priorityIndex: index });
    await get().priorityItem(index);
  },

  preloadTextures: async () => {
    for (let i = 0; i < get().imagens360.length; i++) {
      if (!get().maps[i]?.low?.length) {
        await get().loadLowForIndex(i);
      }
    }
    set({ texturesReady: true });
  },

  priorityItem: async (index) => {
    await Promise.allSettled([
      get().loadLowForIndex(index, true),
      get().loadHighForIndex(index, true),
    ]);

    const img = get().imagens360[index];
    const map = get().maps[index];
    set({
      currentImg360: {
        ...img,
        // @ts-ignore
        url: map.high.length ? map.high : map.low,
        links:
          img.links?.map((l) => ({
            ...l,
            position: new THREE.Vector3(l.position.x, l.position.y, l.position.z),
          })) || [],
      },
      priorityIndex: null,
      texturesReady: true,
    });
  },

  loadLowForIndex: async (index, priority = false) => {
    const { imagens360, maps, loadingLow } = get();
    if (maps[index]?.low?.length) return;

    if (loadingLow[index]) return;
    set((s) => ({ loadingLow: { ...s.loadingLow, [index]: true } }));

    try {
      const urls = imagens360[index].lowRes;
      const chunkSize = priority ? 12 : 4; 
      const textures = await loadInChunks(urls, chunkSize);
      set((s) => ({
        maps: { ...s.maps, [index]: { low: textures, high: s.maps[index]?.high || [] } },
        loadingLow: { ...s.loadingLow, [index]: false },
        texturesReady: true,
      }));
    } catch (err) {
      console.error("[Zones] loadLowForIndex error", err);
      set((s) => ({ loadingLow: { ...s.loadingLow, [index]: false } }));
    }
  },

  loadHighForIndex: async (index, priority = false) => {
    const { imagens360, maps, loadingHighMap } = get();
    if (maps[index]?.high?.length) return;

    if (loadingHighMap[index]) return;
    set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: true } }));

    try {
      if (!maps[index]?.low?.length) await get().loadLowForIndex(index);
      const urls = imagens360[index].highRes;
      const chunkSize = priority ? 12 : 4;
      const textures = await loadInChunks(urls, chunkSize);

      set((s) => ({
        maps: { ...s.maps, [index]: { low: s.maps[index].low, high: textures } },
        loadingHighMap: { ...s.loadingHighMap, [index]: false },
        texturesReady: true,
      }));
    } catch (err) {
      console.error("[Zones] loadHighForIndex error", err);
      set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: false } }));
    }
  },

  startBackgroundPreload: (opts = { low: 12, high: 4 }) => {
    if (get().backgroundStarted) return;
    set({ backgroundStarted: true });

    (async () => {
      const total = get().imagens360.length;

      const tasks: number[] = Array.from({ length: total }, (_, i) => i);

      const worker = async () => {
        while (tasks.length > 0) {
          const p = get().priorityIndex;
          const index = p !== null ? p : tasks.shift();
          if (index === undefined) return;

          await Promise.allSettled([
            get().loadLowForIndex(index),
            get().loadHighForIndex(index),
          ]);

          if (p !== null) set({ priorityIndex: null });
        }
      };

      const workerCount = opts?.low ?? 4;
      const workers = Array.from({ length: workerCount }, () => worker());
      await Promise.allSettled(workers);

      set({ texturesReady: true });
    })();
  },

}));
