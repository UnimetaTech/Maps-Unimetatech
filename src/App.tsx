import React, { useEffect } from "react";
import { useZones } from "@/store/Zones";
import loadingGif from "@/assets/loadingGif.gif";

const Portals = React.memo(
  React.lazy(() => import("@/components/dome").then((module) => ({ default: module.Portals })))
);
const ViewMapsVr = React.lazy(() => import("./layout/ViewMapsVr"));

function App() {
  const { texturesReady, currentIndex, loadLowForIndex, startBackgroundPreload } = useZones();

  useEffect(() => {
    (async () => {
      try {
        await loadLowForIndex(currentIndex);
        startBackgroundPreload({ low: 4, high: 2 }); // 🔥 corregido
      } catch (e) {
        console.error("Error during initial low load or starting background preload", e);
      }
    })();
  }, []);

  if (!texturesReady) {  // 🔥 corregido
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <img src={loadingGif} alt="Loading..." className="w-[30%] md:w-[12%]" />
      </div>
    );
  }

  return (
    <section className="w-screen h-screen">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <img src={loadingGif} alt="Loading..." className="w-[25%] md:w-[10%]" />
          </div>
        }
      >
        <ViewMapsVr>
          <Portals />
        </ViewMapsVr>
      </React.Suspense>
    </section>
  );
}

export default App;

