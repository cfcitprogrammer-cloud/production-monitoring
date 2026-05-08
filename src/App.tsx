import { Route, Routes } from "react-router-dom";
import Sidebar from "./ui/_sidebar";
import BihonPage from "./pages/bh";
import Snackfood from "./pages/sf";
import SummaryPage from "./pages/summary";

function App() {
  return (
    <Routes>
      <Route path="/bihon" element={<BihonPage />} />
      <Route path="/snackfood" element={<Snackfood />} />
      <Route path="/summary" element={<SummaryPage />} />
    </Routes>
  );
}

export default App;
