import { useEffect, useRef, useState } from "react";

// 라우터
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Workout from "./pages/Workout/Workout";
import Hydration from "./pages/Hydration/Hydration";

// components
import Menu from "./components/Menu";

// css
import "./App.css";
import "./App.scss";
import Learning from "./pages/Learning/Learning";

function App() {
  // 메뉴 오픈 상태저장
  const [menuOpen, setmenuOpen] = useState(false);

  // 메뉴 토글함수
  const toggleMenu = () => {
    setmenuOpen((prev) => !prev);
  };
  return (
    <BrowserRouter>
      <div className="App">
        {/* 메뉴버튼 */}
        <img
          src="/images/angle.png"
          alt="angle"
          className={`angle ${menuOpen ? "rotated" : ""}`}
          onClick={toggleMenu}
        />
        <Menu isOpen={menuOpen} closeMenu={toggleMenu} />

        {/* routes */}
        <Routes>
          <Route path="/" element={<Hydration />}></Route>
          <Route path="/hydration" element={<Hydration />}></Route>
          <Route path="/workout" element={<Workout />}></Route>
          <Route path="/learning" element={<Learning />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
