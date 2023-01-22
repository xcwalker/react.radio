import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Player } from "./pages/player";
import { Timetable } from "./pages/timetable";

import "./style/defaults/variables.css"
import "./style/defaults/page-setup.css"
import "./style/defaults/transitions.css"

export default function App() {
  return <>
    <BrowserRouter>
      <ScrollToTop />

      <Helmet>
        <title>ReactRadio</title>
      </Helmet>

      <Header />

      <Routes>
        <Route path="/" element={<Player />} />
        <Route path="timetable" element={<Timetable />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  </>
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}