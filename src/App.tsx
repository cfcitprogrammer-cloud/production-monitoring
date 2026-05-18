import { Route, Routes } from "react-router-dom";
import BihonPage from "./pages/bh";
import Snackfood from "./pages/sf";
import SummaryPage from "./pages/summary";
import LoginPage from "./pages/login";
import CatmonPage from "./pages/catmon";
import SotanghonPage from "./pages/sotanghon";

function App() {
  return (
    <Routes>
      <Route path="/bihon" element={<BihonPage />} />
      <Route path="/snackfood" element={<Snackfood />} />
      <Route path="/canton" element={<CatmonPage />} />
      <Route path="/sotanghon" element={<SotanghonPage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
