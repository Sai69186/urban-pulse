import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";
import Overview      from "./pages/Overview";
import AirQuality    from "./pages/AirQuality";
import Crime         from "./pages/Crime";
import Economic      from "./pages/Economic";
import Healthcare    from "./pages/Healthcare";
import Noise         from "./pages/Noise";
import Neighborhoods from "./pages/Neighborhoods";
import Anomalies     from "./pages/Anomalies";
import Sentiment     from "./pages/Sentiment";
import Forecast      from "./pages/Forecast";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", background: "#070b14", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ marginLeft: 248, flex: 1, display: "flex", flexDirection: "column" }}>
          <Topbar />
          <main style={{ marginTop: 62, padding: "28px 32px", flex: 1 }}>
            <Routes>
              <Route path="/"              element={<Overview />}      />
              <Route path="/air-quality"   element={<AirQuality />}    />
              <Route path="/crime"         element={<Crime />}         />
              <Route path="/economic"      element={<Economic />}      />
              <Route path="/healthcare"    element={<Healthcare />}    />
              <Route path="/noise"         element={<Noise />}         />
              <Route path="/neighborhoods" element={<Neighborhoods />} />
              <Route path="/anomalies"     element={<Anomalies />}     />
              <Route path="/sentiment"     element={<Sentiment />}     />
              <Route path="/forecast"      element={<Forecast />}      />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
