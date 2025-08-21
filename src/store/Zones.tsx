import * as THREE from "three";
import { create } from "zustand";
import type { TImagen360 } from "@/components/dome";
import { imagens360 } from "@/assets/Imagens360";

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
};

type TActionZones = {
  changedImagen: (index: number) => void;
  preloadTextures: () => Promise<void>;
  priorityItem: () => Promise<void>;
  loadHighResTextures: () => Promise<void>;
};

const headers = {
  Origin: "http://localhost:5173",
  Accept: "image/webp,image/*,*/*;q=0.8",
};

async function loadTextureWithHeaders(
  url: string,
  headers: HeadersInit,
): Promise<THREE.Texture> {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    headers,
  });

  if (!response.ok) throw new Error(`Error loading ${url}: ${response.status}`);

  const blob = await response.blob();
  const objectURL = URL.createObjectURL(blob);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = objectURL;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  return texture;
}

async function batchLoadTextures(
  urls: string[],
  headers: HeadersInit,
  batchSize = 16,
): Promise<THREE.Texture[]> {
  const results: THREE.Texture[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const textures = await Promise.all(
      batch.map((url) => loadTextureWithHeaders(url, headers)),
    );
    results.push(...textures);
  }
  return results;
}

export const useZones = create<TStatesZones & TActionZones>()((set, get) => ({
  currentIndex: 0,
  currentImg360: null,
  imagens360: imagens360,
  maps: {},
  loadingHighRes: false,
  lowResLoaded: false,
  texturesReady: false, // Inicialmente no están listas

  changedImagen: async (index) => {
    const { priorityItem, imagens360, maps } = get();

    if (!maps[index]?.low.length) {
      await get().preloadTextures();
    }

    const newImage = imagens360[index];
    const newLinks = newImage.links.map((link) => ({
      ...link,
      position: new THREE.Vector3(link.position.x, link.position.y, link.position.z),
    }));

    set({
      currentIndex: index,
      currentImg360: { ...newImage, links: newLinks },
    });

    await priorityItem();
  },

  preloadTextures: async () => {
    const { imagens360, maps } = get();
    const toLoad: number[] = [];

    imagens360.forEach((_, index) => {
      if (!maps[index]?.low) toLoad.push(index);
    });

    const loadedTextures = await Promise.all(
      toLoad.map(async (index) => {
        const img = imagens360[index];
        const lowResTextures = await batchLoadTextures(img.lowRes, headers, 16);
        return { index, low: lowResTextures, high: [] };
      }),
    );

    const newTextures = loadedTextures.reduce((acc, item) => {
      acc[item.index] = { low: item.low, high: [] };
      return acc;
    }, {} as Record<number, TextureSet>);

    set((state) => ({
      maps: { ...state.maps, ...newTextures },
      lowResLoaded: true,
      texturesReady: true, // Las texturas de baja resolución ahora están listas
    }));
  },

  priorityItem: async () => {
    const { currentIndex, imagens360, maps, loadHighResTextures } = get();
    const currentImage = imagens360[currentIndex];

    if (!maps[currentIndex]?.low.length) {
      const lowResTextures = await batchLoadTextures(currentImage.lowRes, headers, 16);

      set((state) => ({
        maps: {
          ...state.maps,
          [currentIndex]: {
            low: lowResTextures,
            high: state.maps[currentIndex]?.high || [],
          },
        },
        currentImg360: { ...currentImage, url: lowResTextures },
      }));
    }

    if (!maps[currentIndex]?.high.length) {
      await loadHighResTextures();
    }
  },

  loadHighResTextures: async () => {
    const { currentIndex, imagens360 } = get();
    const currentImage = imagens360[currentIndex];

    set({ loadingHighRes: true });

    const highResTextures = await batchLoadTextures(currentImage.highRes, headers, 16);

    set((state) => ({
      maps: {
        ...state.maps,
        [currentIndex]: {
          low: state.maps[currentIndex].low,
          high: highResTextures,
        },
      },
      currentImg360: { ...currentImage, url: highResTextures },
      loadingHighRes: false,
    }));
  },
}));
