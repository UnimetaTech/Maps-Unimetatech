// store/Zones.ts
import * as THREE from "three";
import { create } from "zustand";
import type { TImagen360 } from "@/components/dome";
import { imagens360 } from "@/assets/Imagens360";

// --- Tipos ---
type TextureSet = {
  low: THREE.Texture[];
  high: THREE.Texture[];
};

type TStatesZones = {
  currentIndex: number;
  currentImg360: TImagen360 | null;
  imagens360: TImagen360[];
  maps: Record<number, TextureSet>;
  loadingHighRes: boolean;
  lowResLoaded: boolean;
  texturesReady: boolean;
  loadingInitial: boolean;
  loadingLow: Record<number, boolean>;
  backgroundStarted: boolean;
  loadingHighMap: Record<number, boolean>;
  priorityIndex: number | null; // 👈 zona que tiene prioridad
};

type TActionZones = {
  changedImagen: (index: number) => void;
  preloadTextures: () => Promise<void>;
  priorityItem: (index: number) => Promise<void>;
  loadHighResTextures: () => Promise<void>;
  loadLowForIndex: (index: number) => Promise<void>;
  startBackgroundPreload: (opts?: {
    concurrencyLow?: number;
    concurrencyHigh?: number;
  }) => void;
  loadHighForIndex: (index: number) => Promise<void>;
};

// --- Headers para fetch ---
const headers = {
  Origin: "http://localhost:5173",
  Accept: "image/webp,image/*,*/*;q=0.8",
};

// --- Utilidad para cargar textura con headers ---
async function loadTextureWithHeaders(
  url: string,
  headers: HeadersInit
): Promise<THREE.Texture> {
  const response = await fetch(url, { method: "GET", mode: "cors", headers });
  if (!response.ok) throw new Error(`Error loading ${url}: ${response.status}`);
  const blob = await response.blob();
  const objectURL = URL.createObjectURL(blob);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = objectURL;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      try {
        URL.revokeObjectURL(objectURL);
      } catch {}
      resolve();
    };
    image.onerror = () => {
      try {
        URL.revokeObjectURL(objectURL);
      } catch {}
      reject(new Error(`Failed to load image ${url}`));
    };
  });

  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// --- Batch loader ---
async function batchLoadTextures(
  urls: string[],
  headers: HeadersInit,
  batchSize = 8
): Promise<THREE.Texture[]> {
  const results: THREE.Texture[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const textures = await Promise.all(
      batch.map((url) => loadTextureWithHeaders(url, headers))
    );
    results.push(...textures);
    await new Promise((r) => setTimeout(r, 40));
  }
  return results;
}

// --- STORE ---
export const useZones = create<TStatesZones & TActionZones>()((set, get) => ({
  currentIndex: 0,
  currentImg360: null,
  imagens360,
  maps: {},
  loadingHighRes: false,
  lowResLoaded: false,
  texturesReady: false,
  loadingInitial: true,
  loadingLow: {},
  backgroundStarted: false,
  loadingHighMap: {},
  priorityIndex: null, // 👈 prioridad inicial nula

  // --- Cambio de imagen ---
  changedImagen: async (index) => {
    console.log(`[Zones] changedImagen -> index ${index}`);
    set({ currentIndex: index, priorityIndex: index }); // 👈 marcar prioridad

    await get().priorityItem(index); // 👈 usar versión con prioridad
  },

  // --- Preload general ---
  preloadTextures: async () => {
    const { imagens360 } = get();
    for (let i = 0; i < imagens360.length; i++) {
      if (!get().maps[i]?.low?.length) {
        await get().loadLowForIndex(i).catch(() =>
          console.warn("[Zones] preloadTextures failed for", i)
        );
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    set({ lowResLoaded: true, texturesReady: true });
  },

  // --- Cargar zona con prioridad ---
  priorityItem: async (index) => {
    console.log(`[Zones] priorityItem: forcing load for index ${index}`);
    set({ priorityIndex: index });

    await get().loadLowForIndex(index);

    const img = imagens360[index];
    const mapForIndex = get().maps[index];

    set({
      currentImg360: {
        ...img,
        // @ts-ignore
        url: mapForIndex?.high?.length ? mapForIndex.high : mapForIndex.low,
        links:
          img.links?.map((l: any) => ({
            ...l,
            position: new THREE.Vector3(
              l.position.x,
              l.position.y,
              l.position.z
            ),
          })) || [],
      },
    });

    if (!mapForIndex?.high?.length) {
      await get().loadHighForIndex(index);
    }
    set({ priorityIndex: null }); // 👈 limpiar prioridad después
  },

  // --- Load low ---
  loadLowForIndex: async (index) => {
    const { imagens360, maps } = get();
    if (maps[index]?.low?.length) return;

    if (get().loadingLow[index]) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (get().maps[index]?.low?.length) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
      return;
    }

    set((s) => ({ loadingLow: { ...s.loadingLow, [index]: true } }));
    try {
      const lowResTextures = await batchLoadTextures(
        imagens360[index].lowRes,
        headers,
        8
      );
      set((state) => ({
        maps: {
          ...state.maps,
          [index]: {
            low: lowResTextures,
            high: state.maps[index]?.high || [],
          },
        },
        loadingLow: { ...state.loadingLow, [index]: false },
        lowResLoaded: true,
        texturesReady: true,
        loadingInitial: false,
      }));
    } catch (err) {
      console.error(`[Zones] loadLowForIndex error for ${index}`, err);
      set((state) => ({
        loadingLow: { ...state.loadingLow, [index]: false },
      }));
      throw err;
    }
  },

  // --- Load high ---
  loadHighForIndex: async (index) => {
    const { imagens360, maps } = get();
    if (maps[index]?.high?.length) return;

    if (get().loadingHighMap[index]) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (get().maps[index]?.high?.length) {
            clearInterval(check);
            resolve();
          }
        }, 200);
      });
      return;
    }

    set((s) => ({
      loadingHighMap: { ...s.loadingHighMap, [index]: true },
      loadingHighRes: true,
    }));

    try {
      if (!maps[index]?.low?.length) {
        await get().loadLowForIndex(index);
      }

      const highResTextures = await batchLoadTextures(
        imagens360[index].highRes,
        headers,
        6
      );

      set((state) => ({
        maps: {
          ...state.maps,
          [index]: { low: state.maps[index].low, high: highResTextures },
        },
        loadingHighMap: { ...state.loadingHighMap, [index]: false },
        loadingHighRes: Object.values({
          ...state.loadingHighMap,
          [index]: false,
        }).some(Boolean),
      }));
    } catch (e) {
      console.error(`[Zones] loadHighForIndex error for ${index}`, e);
      set((s) => ({
        loadingHighMap: { ...s.loadingHighMap, [index]: false },
        loadingHighRes: false,
      }));
    }
  },

  // --- Background preload ---
  startBackgroundPreload: (opts = { concurrencyLow: 4, concurrencyHigh: 2 }) => {
    if (get().backgroundStarted) return;
    set({ backgroundStarted: true });

    const concurrencyLow = Math.max(1, opts.concurrencyLow ?? 4);
    const concurrencyHigh = Math.max(1, opts.concurrencyHigh ?? 2);

    (async () => {
      try {
        const total = get().imagens360.length;
        const indices = Array.from({ length: total }, (_, i) => i);
        const highQueue: number[] = [];
        let highActive = 0;

        const scheduleHigh = (idx: number) => {
          if (get().maps[idx]?.high?.length) return;
          if (get().loadingHighMap[idx]) return;

          if (highActive < concurrencyHigh) {
            highActive++;
            get()
              .loadHighForIndex(idx)
              .finally(() => {
                highActive--;
                const next = highQueue.shift();
                if (next !== undefined) scheduleHigh(next);
              });
          } else {
            highQueue.push(idx);
          }
        };

        // workers LOW
        let pointer = 0;
        const lowWorkers = new Array(concurrencyLow).fill(0).map(async () => {
          while (true) {
            // 👇 si hay prioridad, esperar a que termine
            const pIndex = get().priorityIndex;
            if (pIndex !== null) {
              await get().priorityItem(pIndex);
              continue;
            }

            let index: number | undefined;
            if (pointer < indices.length) {
              index = indices[pointer++];
            } else break;

            try {
              if (!get().maps[index]?.low?.length) {
                await get().loadLowForIndex(index);
              }
              scheduleHigh(index);
            } catch (e) {
              console.warn("[Zones] background low worker failed", e);
            }
            await new Promise((r) => setTimeout(r, 30));
          }
        });

        await Promise.all(lowWorkers);

        while (highActive > 0 || highQueue.length > 0) {
          await new Promise((r) => setTimeout(r, 200));
        }

        set({ loadingHighRes: false });
      } catch (err) {
        console.error("[Zones] startBackgroundPreload error", err);
      }
    })();
  },

  loadHighResTextures: async () => {
    const { currentIndex } = get();
    return get().loadHighForIndex(currentIndex);
  },
}));
