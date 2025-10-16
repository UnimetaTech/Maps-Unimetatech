import * as THREE from "three";
import { create } from "zustand";
import type { TImagen360 } from "@/components/dome";
import { imagens360 } from "@/assets/Imagens360";

type TextureSet = { low: (THREE.Texture | undefined)[]; high: (THREE.Texture | undefined)[] };
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
  currentLoadRunId?: number;
  texturesReady: boolean;
  firstShowDone: Record<number, boolean>;
  transitionTick: number;
};

type TActionZones = {
  changedImagen: (index: number) => Promise<void>;
  preloadTextures: () => Promise<void>;
  priorityItem: (index: number) => Promise<void>;
  loadLowForIndex: (index: number, priority?: boolean, ownerRunId?: number) => Promise<void>;
  loadHighForIndex: (
    index: number,
    priority?: boolean,
    ownerRunId?: number,
    offset?: number,
    len?: number
  ) => Promise<void>;
  startBackgroundPreload: (opts?: { low?: number; high?: number; startIndex?: number }) => void;
};

let _runCounter = 0;
function nextRunId() {
  _runCounter += 1;
  return _runCounter;
}

const textureCache = new Map<string, Promise<THREE.Texture | undefined>>();
let _placeholderTex: THREE.Texture | null = null;

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Error cargando imagen: " + url));
    img.src = url;
  });
}

function createPlaceholderTexture(): THREE.Texture {
  if (_placeholderTex) return _placeholderTex;
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#777";
  ctx.fillRect(0, 0, 2, 2);
  const tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  _placeholderTex = tex;
  return tex;
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
    } catch (e) {
      console.warn("fetchTextureWithCache error", e, url);
      return undefined;
    }
  })();

  textureCache.set(url, p);
  return p;
}

async function loadInParallel(urls: string[], maxParallel = 8): Promise<(THREE.Texture | undefined)[]> {
  const result: (THREE.Texture | undefined)[] = new Array(urls.length);
  let current = 0;
  async function worker() {
    while (current < urls.length) {
      const i = current++;
      try {
        const tex = await fetchTextureWithCache(urls[i]);
        result[i] = tex;
      } catch {
        result[i] = undefined;
      }
    }
  }
  const workers = Array.from({ length: Math.min(maxParallel, urls.length) }, worker);
  await Promise.all(workers);
  return result;
}

async function loadChunked(
  urls: string[],
  chunkSize = 8,
  parallelPerChunk = 8,
  onChunk?: (textures: (THREE.Texture | undefined)[], globalIndexOffset: number) => void,
  shouldAbort?: () => boolean
): Promise<(THREE.Texture | undefined)[]> {
  const total = urls.length;
  const result: (THREE.Texture | undefined)[] = new Array(total).fill(undefined);
  if (total === 0) return result;

  const priorityChunk = urls.slice(0, chunkSize);
  const rest: string[][] = [];
  for (let i = chunkSize; i < total; i += chunkSize) rest.push(urls.slice(i, i + chunkSize));

  const firstLoaded = await loadInParallel(priorityChunk, parallelPerChunk);
  for (let i = 0; i < firstLoaded.length; i++) result[i] = firstLoaded[i];
  onChunk?.(firstLoaded, 0);
  if (shouldAbort?.()) return result;

  for (let c = 0; c < rest.length; c++) {
    if (shouldAbort && shouldAbort()) return result;
    const chunk = rest[c];
    const offset = chunkSize + c * chunkSize;
    const loaded = await loadInParallel(chunk, parallelPerChunk);
    for (let j = 0; j < loaded.length; j++) result[offset + j] = loaded[j];
    onChunk?.(loaded, offset);
    await new Promise((r) => setTimeout(r, 0));
    if (shouldAbort && shouldAbort()) return result;
  }
  return result;
}

function isComplete(arr: (THREE.Texture | undefined)[] | undefined, expected: number) {
  if (!arr || arr.length < expected) return false;
  return arr.every(Boolean);
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
  currentLoadRunId: undefined,
  texturesReady: false,
  firstShowDone: {},
  transitionTick: 0,

  changedImagen: async (index) => {
    const runId = nextRunId();
    set({
      currentLoadRunId: runId,
      backgroundRunId: undefined,
      texturesReady: false,
      priorityIndex: index,
      firstShowDone: { ...get().firstShowDone, [index]: false },
    });

    if (!get().maps[index]) set({ maps: { ...get().maps, [index]: { low: [], high: [] } } });

    await get().loadLowForIndex(index, true, runId);

    if (get().currentLoadRunId === runId) {
      get().loadHighForIndex(index, true, runId).catch(() => { });

      const img = get().imagens360[index];
      const map = get().maps[index];
      const preferHigh = !!map?.high && isComplete(map.high, img.highRes.length);
      const toShow = preferHigh ? map!.high : map?.low ?? [];
      const placeholder = createPlaceholderTexture();
      const provided = (toShow as (THREE.Texture | undefined)[]).map((t) => t ?? placeholder) as THREE.Texture[];

      set({
        currentIndex: index,
        currentImg360: { ...img, url: provided },
        priorityIndex: null,
        texturesReady: preferHigh ? true : isComplete(map?.low, img.lowRes.length),
      });
    } else {
      set({ priorityIndex: null });
    }
  },

  preloadTextures: async () => {
    return;
  },

  priorityItem: async (index) => {
    await get().changedImagen(index);
  },

  loadLowForIndex: async (index, priority = false, ownerRunId?: number) => {
    const urls = get().imagens360[index]?.lowRes;
    if (!urls?.length) return;

    const existing = get().maps[index]?.low ?? new Array(urls.length).fill(undefined);
    if (isComplete(existing, urls.length)) return;

    set((s) => ({ loadingLow: { ...s.loadingLow, [index]: true } }));

    const runId = typeof ownerRunId === "number" ? ownerRunId : get().currentLoadRunId;
    const chunkSize = 8;
    const parallel = priority ? 12 : 8;

    const shouldAbort = () => runId !== get().currentLoadRunId;

    try {
      await loadChunked(
        urls,
        chunkSize,
        parallel,
        async (chunkTextures, offset) => {
          if (shouldAbort()) return;

          for (let i = 0; i < chunkTextures.length; i++) {
            if (!existing[offset + i]) existing[offset + i] = chunkTextures[i];
          }

          const placeholder = createPlaceholderTexture();
          const lowProvided = existing.map((t) => t ?? placeholder) as THREE.Texture[];

          set((s) => {
            const prev = s.maps[index] ?? { low: [], high: [] };
            const newMaps = { ...s.maps, [index]: { low: existing.slice(), high: prev.high ?? [] } };

            const pct = existing.filter(Boolean).length / urls.length;
            const shouldShowNow = pct >= 0.6 && runId === s.currentLoadRunId && !s.firstShowDone?.[index];

            if (shouldShowNow) {
              return {
                maps: newMaps,
                currentImg360: { ...s.imagens360[index], url: lowProvided },
                firstShowDone: { ...s.firstShowDone, [index]: true },
                transitionTick: s.transitionTick + 1,
                texturesReady: pct >= 1,
              };
            } else {
              return { maps: newMaps };
            }
          });
        },
        shouldAbort
      );
    } finally {
      set((s) => ({ loadingLow: { ...s.loadingLow, [index]: false } }));
    }
  },

  loadHighForIndex: async (index, priority = false, ownerRunId?: number, offset?: number, len?: number) => {
    const urlsAll = get().imagens360[index]?.highRes;
    if (!urlsAll?.length) return;

    if (!get().maps[index]) set({ maps: { ...get().maps, [index]: { low: [], high: [] } } });

    const existingHigh = get().maps[index]?.high ?? new Array(urlsAll.length).fill(undefined);

    const runId = typeof ownerRunId === "number" ? ownerRunId : get().currentLoadRunId;
    const shouldAbort = () => runId !== get().currentLoadRunId;

    if (typeof offset === "number" && typeof len === "number") {
      const sliceUrls = urlsAll.slice(offset, offset + len);
      if (!sliceUrls.length) return;
      try {
        const loadedSlice = await loadInParallel(sliceUrls, priority ? 8 : 6);
        if (shouldAbort()) return;

        for (let i = 0; i < loadedSlice.length; i++) {
          if (!existingHigh[offset + i]) existingHigh[offset + i] = loadedSlice[i];
        }

        set((s) => {
          const lowArr = s.maps[index]?.low ?? [];
          const placeholder = createPlaceholderTexture();
          const combined = lowArr.map((low, i) => existingHigh[i] ?? low ?? placeholder) as THREE.Texture[];

          if (s.currentLoadRunId === runId && s.currentIndex === index) {
            return {
              maps: { ...s.maps, [index]: { low: lowArr.slice(), high: existingHigh.slice() } },
              currentImg360: { ...s.imagens360[index], url: combined },
            };
          } else {
            return { maps: { ...s.maps, [index]: { low: lowArr.slice(), high: existingHigh.slice() } } };
          }
        });

        const pct = existingHigh.filter(Boolean).length / urlsAll.length;
        if (pct >= 0.7 && !shouldAbort()) set({ texturesReady: true });
      } catch (e) {
      }
      return;
    }

    if (isComplete(existingHigh, urlsAll.length)) return;

    set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: true } }));

    try {
      await loadChunked(
        urlsAll,
        8,
        priority ? 8 : 4,
        (chunkTextures, offsetGlobal) => {
          if (shouldAbort()) return;

          for (let i = 0; i < chunkTextures.length; i++) {
            if (!existingHigh[offsetGlobal + i]) existingHigh[offsetGlobal + i] = chunkTextures[i];
          }

          set((s) => {
            const lowArr = s.maps[index]?.low ?? [];
            const placeholder = createPlaceholderTexture();
            const combined = lowArr.map((low, i) => existingHigh[i] ?? low ?? placeholder) as THREE.Texture[];

            if (s.currentLoadRunId === runId && s.currentIndex === index) {
              return {
                maps: { ...s.maps, [index]: { low: lowArr.slice(), high: existingHigh.slice() } },
                currentImg360: { ...s.imagens360[index], url: combined },
              };
            } else {
              return { maps: { ...s.maps, [index]: { low: lowArr.slice(), high: existingHigh.slice() } } };
            }
          });

          const pct = existingHigh.filter(Boolean).length / urlsAll.length;
          if (pct >= 0.7 && !shouldAbort()) set({ texturesReady: true });
        },
        shouldAbort
      );
    } finally {
      set((s) => ({ loadingHighMap: { ...s.loadingHighMap, [index]: false } }));
    }
  },

  startBackgroundPreload: (_opts = { low: 2, high: 0, startIndex: undefined }) => {
    set({ backgroundRunId: undefined });
    return;
  },
}));
