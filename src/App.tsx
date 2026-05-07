import { Route, Routes } from "react-router-dom";
import Sidebar from "./ui/_sidebar";
import BihonPage from "./pages/bh";
import Snackfood from "./pages/sf";

function App() {
  return (
    <Routes>
      <Route path="/bihon" element={<BihonPage />} />
      <Route path="/snackfood" element={<Snackfood />} />
    </Routes>
  );
}

export default App;
