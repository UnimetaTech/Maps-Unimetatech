import * as THREE from "three";
import { create } from "zustand";
import type { TImagen360 } from "@/components/dome";
import { imagens360 } from "@/assets/Imagens360";

type TextureSet = { low: THREE.Texture[]; high: THREE.Texture[] };
export type TImagen360Extended = TImagen360 & { url?: THREE.Texture[] };

type TStatesZones = {
  currentIndex: number;
  currentImg360: TImagen360Extended | null;
  imagens360: TImagen360[];
  maps: Record<number, TextureSet>;
  loadingLow: Record<number, boolean>;
  loadingHighMap: Record<number, boolean>;
  priorityIndex: number | null;
  backgroundRunId?: number;
  texturesReady: boolean;
};

type TActionZones = {
  changedImagen: (index: number) => Promise<void>;
  preloadTextures: () => Promise<void>;
  priorityItem: (index: number) => Promise<void>;
  loadLowForIndex: (index: number, priority?: boolean) => Promise<void>;
  loadHighForIndex: (index: number, priority?: boolean) => Promise<void>;
  startBackgroundPreload: (opts?: { low?: number; high?: number; startIndex?: number }) => void;
};

const textureCache = new Map<string, Promise<THREE.Texture | undefined>>();

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Error cargando imagen: " + url));
    img.src = url;
  });
}

function fetchTextureWithCache(url: string): Promise<THREE.Texture | undefined> {
  if (textureCache.has(url)) return textureCache.get(url)!;

  const p = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return undefined;
      const blob = await res.blob();
      const img = await loadImage(URL.createObjectURL(blob));
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    } catch {
      return undefined;
    }
  })();

  textureCache.set(url, p);
  return p;
}

async function loadInParallel(
  urls: string[],
  maxParallel = 6
): Promise<THREE.Texture[]> {
  const result: (THREE.Texture | undefined)[] = new Array(urls.length);
  let current = 0;

  async function worker() {
    while (current < urls.length) {
      const i = current++;
      const tex = await fetchTextureWithCache(urls[i]);
      result[i] = tex;
    }
  }

  const workers = Array.from({ length: Math.min(maxParallel, urls.length) }, worker);
  await Promise.all(workers);
  return result.filter(Boolean) as THREE.Texture[];
}

function isComplete(arr: (THREE.Texture | undefined)[] | undefined, expected: number) {
  if (!arr || arr.length < expected) return false;
  return arr.every(Boolean);
}

function getNextIndexes(startIndex: number, count: number, total: number) {
  const arr: number[] = [];
  for (let i = 1; i <= count; i++) arr.push((startIndex + i) % total);
  return arr;
}

export const useZones = create<TStatesZones & TActionZones>()((set, get) => ({
  currentIndex: 0,
  currentImg360: null,
  imagens360,
  maps: {},
  loadingLow: {},
  loadingHighMap: {},
  priorityIndex: null,
  backgroundRunId: undefined,
  texturesReady: false,

  changedImagen: async (index) => {
    const { maps, imagens360, priorityItem } = get();
    if (!maps[index] || !isComplete(maps[index].low, imagens360[index].lowRes.length)) {
      await priorityItem(index);
    }
    set((s) => {
      const map = s.maps[index];
      return {
        currentIndex: index,
        currentImg360: { ...s.imagens360[index], url: map?.low ?? [] },
        texturesReady: true,
      };
    });
    get().startBackgroundPreload({ startIndex: index, low: 2 });
  },

  preloadTextures: async () => {
    const { currentIndex, priorityItem, startBackgroundPreload } = get();
    await priorityItem(currentIndex);
    startBackgroundPreload({ startIndex: currentIndex, low: 2 });
  },

  priorityItem: async (index) => {
    const { imagens360 } = get();
    set({ priorityIndex: index, texturesReady: false });
    await get().loadLowForIndex(index, true);
    get().loadHighForIndex(index, true).catch(() => {});

    const img = imagens360[index];
    const map = get().maps[index];
    set({
      currentImg360: { ...img, url: map?.high?.length ? map.high : map?.low },
      priorityIndex: null,
      texturesReady: true,
    });

    get().startBackgroundPreload({ startIndex: index, low: 2 });
  },

  loadLowForIndex: async (index, priority = false) => {
    const { imagens360, maps } = get();
    const urls = imagens360[index].lowRes;
    if (maps[index] && isComplete(maps[index].low, urls.length)) return;

    set((s) => ({ loadingLow: { ...s.loadingLow, [index]: true } }));

    try {
      const texs = await loadInParallel(urls, priority ? 10 : 4);
      set((s) => ({
        maps: { ...s.maps, [index]: { low: texs, high: s.maps[index]?.high ?? [] } },
      }));
    } finally {
      set((s) => ({ loadingLow: { ...s.loadingLow, [index]: false } }));
    }
  },

  loadHighForIndex: async (index, priority = false) => {
    const { imagens360, maps } = get();
    const urls = imagens360[index].highRes;
    if (maps[index] && isComplete(maps[index].high, urls.length)) return;

    set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: true } }));

    try {
      const texs = await loadInParallel(urls, priority ? 8 : 3);
      set((s) => ({
        maps: { ...s.maps, [index]: { low: s.maps[index]?.low ?? [], high: texs } },
      }));
    } finally {
      set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: false } }));
    }
  },

  startBackgroundPreload: (opts = { low: 2, high: 0, startIndex: undefined }) => {
    const runId = Date.now();
    const { imagens360 } = get();
    const total = imagens360.length;
    const lowCount = opts.low ?? 2;
    const highCount = opts.high ?? 0;
    const startIndex = typeof opts.startIndex === "number" ? opts.startIndex : get().currentIndex;

    set({ backgroundRunId: runId });

    (async () => {
      const lowIndexes = getNextIndexes(startIndex, lowCount, total);
      await Promise.all(
        lowIndexes.map((idx) => get().loadLowForIndex(idx).catch(() => {}))
      );

      if (highCount > 0) {
        const highIndexes = lowIndexes.slice(0, highCount);
        await Promise.all(
          highIndexes.map((idx) => get().loadHighForIndex(idx).catch(() => {}))
        );
      }

      if (get().backgroundRunId === runId) {
        set({ backgroundRunId: undefined, texturesReady: true });
      }
    })();
  },
}));
