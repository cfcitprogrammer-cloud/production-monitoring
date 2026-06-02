import { Route, Routes } from "react-router-dom";
import BihonPage from "./pages/bh";
import Snackfood from "./pages/sf";
import SummaryPage from "./pages/summary";
import LoginPage from "./pages/login";
import CatmonPage from "./pages/catmon";
import SotanghonPage from "./pages/sotanghon";
import HEPage from "./pages/he";
import KFCantonPage from "./pages/kf_canton";
import KFSFPage from "./pages/kf_sf";
import SupabaseManufacturingReport from "./pages/dashboard";

function App() {
  return (
    <Routes>
      <Route path="/aa" element={<SupabaseManufacturingReport />} />
      <Route path="/bihon" element={<BihonPage />} />
      <Route path="/snackfood" element={<Snackfood />} />
      <Route path="/canton" element={<CatmonPage />} />
      <Route path="/sotanghon" element={<SotanghonPage />} />
      <Route path="/kf-he" element={<HEPage />} />
      <Route path="/kf-canton" element={<KFCantonPage />} />
      <Route path="/kf-snackfood" element={<KFSFPage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
