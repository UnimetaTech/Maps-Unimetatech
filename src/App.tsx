import React, { Suspense } from "react";
import loadingGif from "@/assets/loadingGif.gif";

const Portals = React.memo(
  React.lazy(() => import("@/components/dome").then((module) => ({ default: module.Portals })))
);


const ViewMapsVr = React.lazy(() => import("./layout/ViewMapsVr"));

function App() {


  return (
    <section className="w-screen h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <img src={loadingGif} alt="Loading..." className="w-[25%] md:w-[10%]" />
          </div>
        }
      >
        <ViewMapsVr>
          <Portals />
        </ViewMapsVr>
      </Suspense>
    </section>
  );
}

export default App;
