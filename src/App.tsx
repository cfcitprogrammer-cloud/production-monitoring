import { Route, Routes } from "react-router-dom";
import BihonPage from "./pages/bh";
import Snackfood from "./pages/sf";
import SummaryPage from "./pages/summary";
import CantonPage from "./pages/canton";
import LoginPage from "./pages/login";
import CatmonPage from "./pages/catmon";

function App() {
  return (
    <Routes>
      <Route path="/bihon" element={<BihonPage />} />
      <Route path="/canton" element={<CantonPage />} />
      <Route path="/snackfood" element={<Snackfood />} />
      <Route path="/catmon" element={<CatmonPage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
