
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useZones } from "@/store/Zones";
import loadingGif from "@/assets/loadingGif.gif";

const PortalsLazy = () => import("@/components/dome").then((m) => ({ default: m.Portals }));
const ViewMapsVrLazy = () => import("./layout/ViewMapsVr");

const Portals = React.memo(React.lazy(PortalsLazy));
const ViewMapsVr = React.lazy(ViewMapsVrLazy);

function App() {
  const { texturesReady, preloadTextures } = useZones();
  const [showLoader, setShowLoader] = useState(true);
  const [lazyReady, setLazyReady] = useState(false);

  useEffect(() => {
    Promise.all([PortalsLazy(), ViewMapsVrLazy()])
      .then(() => setLazyReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    preloadTextures().catch(console.error);
  }, []);

  useEffect(() => {
    if (texturesReady && lazyReady) {
      const timeout = setTimeout(() => setShowLoader(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [texturesReady, lazyReady]);

  return (
    <section className="w-screen h-screen overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        {showLoader ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex items-center justify-center h-screen w-screen bg-white"
          >
            <img
              src={loadingGif}
              alt="Loading..."
              className="w-[30%] md:w-[12%] select-none pointer-events-none"
            />
          </motion.div>
        ) : (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-screen h-screen"
          >
            <React.Suspense fallback={null}>
              <ViewMapsVr>
                <Portals />
              </ViewMapsVr>
            </React.Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default App;
