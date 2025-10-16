import React, { useEffect, useState } from "react";
import { useZones } from "@/store/Zones";
import loadingGif from "@/assets/loadingGif.gif";

const PortalsLazy = () => import("@/components/dome").then((m) => ({ default: m.Portals }));
const ViewMapsVrLazy = () => import("./layout/ViewMapsVr");

const Portals = React.memo(React.lazy(PortalsLazy));
const ViewMapsVr = React.lazy(ViewMapsVrLazy);

const FADE_MS = 800;

function App(): JSX.Element {
  const { texturesReady, preloadTextures, firstShowDone, priorityItem } = useZones();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [lazyReady, setLazyReady] = useState<boolean>(false);
  const [sceneVisible, setSceneVisible] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([PortalsLazy(), ViewMapsVrLazy()])
      .then(() => setLazyReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    priorityItem(0).catch(console.error);
    preloadTextures().catch(console.error);
  }, []);

  useEffect(() => {
    const primeraLista = firstShowDone?.[0] === true;
    const readyToShow = lazyReady && (texturesReady || primeraLista);

    if (readyToShow) {
      setShowLoader(false);

      const t = setTimeout(() => {
        setSceneVisible(true);
      }, FADE_MS + 20);

      return () => clearTimeout(t);
    }
  }, [texturesReady, lazyReady, firstShowDone]);

  return (
    <section className="w-screen h-screen overflow-hidden bg-white relative">
      <div
        aria-hidden={showLoader ? "false" : "true"} 
        className={`absolute inset-0 flex items-center justify-center bg-white transition-opacity duration-[800ms] ease-in-out ${
          showLoader ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src={loadingGif}
          alt="Cargando..."
          className="w-[30%] md:w-[12%] select-none pointer-events-none"
          draggable={false}
        />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
          sceneVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <React.Suspense fallback={null}>
          <ViewMapsVr>
            <Portals />
          </ViewMapsVr>
        </React.Suspense>
      </div>
    </section>
  );
}

export default App;
