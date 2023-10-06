import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

import { Footer } from "./components/footer";
import { Player } from "./pages/player";

import "./style/defaults/variables.css";
import "./style/defaults/page-setup.css";
import "./style/defaults/transitions.css";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Navigate to="/station/simulator-radio" />} />
          <Route path="sr" element={<Navigate to="/station/simulator-radio" />} />
          <Route path="srrock" element={<Navigate to="/station/simulator-radio-rock" />} />
          <Route path="sr-rock" element={<Navigate to="/station/simulator-radio-rock" />} />

          <Route path="station">
            <Route
              path="simulator-radio"
              element={
                <Player
                  station="Simulator Radio"
                  audioUrl="https://simulatorradio.stream/320"
                  apiUrl="https://apiv2.simulatorradio.com/metadata/combined"
                  apiHistoryUrl="https://apiv2.simulatorradio.com/metadata/history?limit="
                  apiTimetableUrl="https://apiv2.simulatorradio.com/timetable?day="
                />
              }
            />
            <Route
              path="simulator-radio-rock"
              element={
                <Player
                  station="SR Rock"
                  audioUrl="https://simulatorradio.stream/rock"
                  apiUrl="https://apiv2.simulatorradio.com/rock/nowplaying"
                  apiHistoryUrl="https://apiv2.simulatorradio.com/rock/history?page=1&pagesize="
                />
              }
            />
            <Route
              path="truckers-fm"
              element={
                <Player
                  station="Truckers FM"
                  audioUrl="https://live.truckers.fm/"
                  apiUrl="https://radiocloud.pro/api/public/v1/song/current"
                  apiLive="https://radiocloud.pro/api/public/v1/presenter/live"
                  apiHistoryUrl="https://radiocloud.pro/api/public/v1/song/recent?limit="
                />
              }
            />
            <Route path="srrock" element={<Navigate to="../simulator-radio-rock" />} />
            <Route path="sr-rock" element={<Navigate to="../simulator-radio-rock" />} />
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const stations = [
  {
    station: "Simulator Radio",
    url: "/station/simulator-radio",
  },
  {
    station: "SR Rock",
    url: "/station/simulator-radio-rock",
  },
  {
    station: "Truckers FM",
    url: "/station/truckers-fm",
  },
];
