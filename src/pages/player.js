import { Fragment, useCallback, useEffect } from "react";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Link } from "react-router-dom";

import "../style/pages/player.css";
import "../style/pages/switcher.css";
import "../style/pages/history.css";
import "../style/pages/timetable.css";
import { stations } from "../App";

export function Player(props) {
  const [dj, setDJ] = useState();
  const [nowPlaying, setNowPlaying] = useState();
  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);
  const [audioUrlState, setAudioUrlState] = useState("");
  const [state, setState] = useState("paused");
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    fetch(props.apiUrl)
      .then(
        (data) => {
          data.json().then((res) => {
            let outNow = {};
            let outDJ = {};

            if (res?.now_playing?.title) {
              outNow.title = res?.now_playing?.title;
            } else if (res.title) {
              outNow.title = res.title;
            } else {
              outNow.title = "";
            }

            if (res?.now_playing?.artists) {
              outNow.artists = res?.now_playing?.artists;
            } else if (res.artist) {
              outNow.artists = res.artist;
            } else {
              outNow.artists = "";
            }

            if (res?.now_playing?.art) {
              outNow.art = res?.now_playing?.art;
            } else if (res.art.large) {
              outNow.art = res.art.large;
            } else {
              outNow.art = "";
            }

            if (res?.djs?.now?.displayname) {
              outDJ.displayname = res.djs.now.displayname;
            }

            if (res?.djs?.now?.avatar) {
              outDJ.avatar = res.djs.now.avatar;
            }

            if (res?.djs?.now?.details) {
              outDJ.details = res.djs.now.details;
            }

            setNowPlaying(outNow);
            setDJ(outDJ);
          });
        },
        (error) => {
          console.error(error);
        }
      )
      .catch((error) => {
        console.error(error);
      });
  }, [count, props.apiUrl]);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setCount(count + 1), 3000);
    return () => clearTimeout(timer);
  }, [count, ticking]);

  function stop() {
    setAudioUrlState("");
    setState("paused");
    return;
  }

  const playPause = useCallback(() => {
    var player = document.querySelector("#audioPlayer");

    if (audioUrlState === "") {
      setAudioUrlState(props.audioUrl);
    }

    if (state === "paused") {
      setState("play");
      player.play();
      return;
    } else if (state === "play") {
      setState("paused");
      player.pause();
      return;
    }
  }, [audioUrlState, state, props.audioUrl]);

  useEffect(() => {
    setAudioUrlState("");
    setState("paused");
    return;
  }, [props.audioUrl]);

  async function live() {
    var player = document.querySelector("#audioPlayer");

    if (audioUrlState === "") {
      setAudioUrlState(props.audioUrl);
    }

    setState("play");
    await player.load();
    player.play();
  }

  function rewind() {
    var player = document.querySelector("#audioPlayer");

    player.currentTime = player.currentTime - 10;
  }

  function fastForward() {
    var player = document.querySelector("#audioPlayer");
    var newTime = player.currentTime + 30;

    if (newTime < player.duration + 5) {
      player.currentTime = newTime;
    }
  }

  function volumeChange(e) {
    var player = document.querySelector("#audioPlayer");
    setVolume(e.target.value);
    player.volume = e.target.value / 100;
  }

  useEffect(() => {
    if (nowPlaying === undefined || nowPlaying === null || audioUrlState === "" || navigator.mediaSession.metadata?.title === nowPlaying.title) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nowPlaying.title,
        artist: nowPlaying.artists,
        album: "ReactRadio",
        artwork: [{ src: nowPlaying.art }],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        console.log("play");

        setState("play");
        document.querySelector("#audioPlayer").play();
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("pause");

        setState("paused");
        document.querySelector("#audioPlayer").pause();
      });
    }
  }, [nowPlaying, playPause, audioUrlState]);

  return (
    <>
      <Helmet>
        <meta name="twitter:title" content={props.station + " | ReactRadio"} />
        {state === "paused" && audioUrlState === "" && <title>{props.station + " | ReactRadio"}</title>}
        {state === "paused" && audioUrlState !== "" && nowPlaying?.artists && (
          <title>{nowPlaying?.title + " - " + nowPlaying?.artists + " | " + props.station + " | ReactRadio"}</title>
        )}
        {state === "play" && audioUrlState !== "" && nowPlaying?.artists && (
          <title>{nowPlaying?.title + " - " + nowPlaying?.artists + " | " + props.station + " | ReactRadio"}</title>
        )}
        <meta name="description" content={props.station + " on ReactRadio | A lightweight react based website for streaming radio."} />
        <meta name="twitter:description" content={props.station + " on ReactRadio | A lightweight react based website for streaming radio."} />
      </Helmet>
      <section
        id="player"
        onLoad={() => {
          setTicking(true);
        }}
      >
        {dj && (
          <div className="dj">
            {dj?.avatar && (
              <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + dj?.avatar} alt={dj?.avatar + "'s avatar"} className="profilePicture" />
            )}
            <div className="about">
              <span className="title">{dj?.displayname}</span>
              <ReactMarkdown className="subTitle">{dj?.details}</ReactMarkdown>
            </div>
          </div>
        )}
        <div className="container">
          <div className="player">
            <div
              className="art"
              onClick={() => {
                stop();
              }}
            >
              <img src={nowPlaying?.art} alt={"The artwork of " + nowPlaying?.title + " by " + nowPlaying?.artists} />

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.47 135.47">
                <path d="m0 0 45.155 45.155h45.156V90.31h45.155V45.155L90.311 0zm90.311 90.311L45.155 45.156v45.155l45.156 45.156h45.155zm-45.156 0L0 45.156v90.311h45.155z" />
              </svg>

              {state === "paused" && (
                <button
                  className="material-symbols-outlined large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Play"
                >
                  play_arrow
                </button>
              )}
              {state === "play" && (
                <button
                  className="material-symbols-outlined large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Pause"
                >
                  pause
                </button>
              )}
            </div>
            <div className="info">
              <span className="title">{nowPlaying?.title}</span>
              <span className="subTitle">{nowPlaying?.artists}</span>
            </div>
          </div>
          <div className="controls">
            <div className="left">
              {document.querySelector("#audioPlayer")?.currentTime + 7.5 > document.querySelector("#audioPlayer")?.duration && (
                <span className="live">Live</span>
              )}
            </div>
            <div className="info">
              <span className="title">{nowPlaying?.title}</span>
              <span className="subTitle">{nowPlaying?.artists}</span>
            </div>
            <div className="center">
              <button
                className="material-symbols-outlined"
                onClick={() => {
                  rewind();
                }}
                disabled={document.querySelector("#audioPlayer")?.currentTime < 10}
                title="Rewind 10s"
              >
                replay_10
              </button>
              <button
                className="material-symbols-outlined"
                onClick={() => {
                  live();
                }}
                title="Live"
              >
                stream
              </button>

              {state === "paused" && (
                <button
                  className="material-symbols-outlined large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Play"
                >
                  play_circle
                </button>
              )}
              {state === "play" && (
                <button
                  className="material-symbols-outlined large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Pause"
                >
                  pause_circle
                </button>
              )}

              <button
                className="material-symbols-outlined"
                onClick={() => {
                  stop();
                }}
                title="Stop"
              >
                stop_circle
              </button>
              <button
                className="material-symbols-outlined"
                onClick={() => {
                  fastForward();
                }}
                disabled={document.querySelector("#audioPlayer")?.currentTime + 30 > document.querySelector("#audioPlayer")?.duration + 5}
                title="FastForward 30s"
              >
                forward_30
              </button>
            </div>
            <div className="right">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                className="slider"
                id="volume"
                onChange={(e) => {
                  volumeChange(e);
                }}
              />
            </div>
          </div>
        </div>
        {/* <div className="mobile"></div> */}
        <img src={nowPlaying?.art} alt="" className="background" />
      </section>
      <audio src={audioUrlState} id="audioPlayer" autoPlay="autoplay" crossOrigin="anonymous" />
      <Switcher station={props.station} />
      {props.apiHistoryUrl && <History apiHistoryUrl={props.apiHistoryUrl} />}
      {props.apiTimetableUrl && <Timetable apiTimetableUrl={props.apiTimetableUrl} />}
    </>
  );
}

function Switcher(props) {
  return (
    <>
      <section id="switcher">
        <div className="container">
          <h2>Switch Station</h2>
          <ul>
            {stations &&
              stations.map((item, index) => {
                if (item.station === props.station)
                  return (
                    <li key={index}>
                      <h1 className="current" title="Current Station">
                        {item.station}
                      </h1>
                    </li>
                  );
                return (
                  <li key={index}>
                    <Link to={item.url}>{item.station}</Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
    </>
  );
}

function History(props) {
  const [history, setHistory] = useState();
  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(props.apiHistoryUrl + "7").then(
      (data) => {
        data.json().then((res) => {
          setHistory(res);
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }, [count, props.apiHistoryUrl]);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setCount(count + 1), 3000);
    return () => clearTimeout(timer);
  }, [count, ticking]);

  return (
    <>
      <section id="history">
        <div className="container">
          <h2>History</h2>
          <ul>
            {history &&
              history.map((item, index) => {
                if (index === 0) {
                  return <Fragment key={index} />;
                }
                return (
                  <li key={index}>
                    {item.art.large && <img src={item.art.large} alt="" />}
                    {!item.art.large && item.art.large !== null && <img src={item.art} alt="" />}
                    <div className="info">
                      {item.artists && <span className="subTitle">{item.artists}</span>}
                      {item.artist && <span className="subTitle">{item.artist}</span>}
                      <span className="title">{item.title}</span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
    </>
  );
}

function Timetable(props) {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [timetable, setTimetable] = useState();
  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    fetch(props.apiTimetableUrl + dayIndex).then(
      (data) => {
        data.json().then((res) => {
          setTimetable(res.slots);
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }, [count, dayIndex, props.apiTimetableUrl]);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setCount(count + 1), 20000);
    return () => clearTimeout(timer);
  }, [count, ticking]);

  function addDay() {
    setDisplayDate(new Date(displayDate.setDate(displayDate.getDate() + 1)));
    setDayIndex(dayIndex + 1);
  }

  function removeDay() {
    setDisplayDate(new Date(displayDate.setDate(displayDate.getDate() - 1)));
    setDayIndex(dayIndex - 1);
  }

  return (
    <section id="timetable">
      <div className="container">
        <h2>Timetable</h2>
        <div className="inline">
          <button
            onClick={() => {
              removeDay();
            }}
            className="material-symbols-outlined"
          >
            remove
          </button>
          <h3>
            {displayDate.toLocaleDateString("en-gb", { weekday: "long" })} {displayDate.getDate()} {displayDate.toLocaleDateString("en-gb", { month: "long" })}{" "}
            {displayDate.getFullYear()}
          </h3>
          <button
            onClick={() => {
              addDay();
            }}
            className="material-symbols-outlined"
          >
            add
          </button>
        </div>
        <ul>
          {timetable &&
            timetable.map((slot, index) => {
              return (
                <Fragment key={index}>
                  <TimetableItem slot={slot} />
                </Fragment>
              );
            })}
        </ul>
      </div>
    </section>
  );
}

function TimetableItem(props) {
  const [date, setDate] = useState();

  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  useEffect(() => {
    if (!props.slot.slotstamp) return;

    setDate(new Date(props.slot.slotstamp * 1000));
  }, [props.slot]);

  return (
    <li>
      <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + props.slot.dj.avatar} alt="" />
      <div className="info">
        <div className="inline">
          <span className="title">{props.slot.dj.display_name}</span>
          {date && (
            <span className="date">
              {addZero(date.getHours())}:{addZero(date.getMinutes())} - {addZero(date.getHours() + 1)}:{addZero(date.getMinutes())}
            </span>
          )}
        </div>
        <ReactMarkdown className="subTitle">{props.slot.details.toString()}</ReactMarkdown>
      </div>
    </li>
  );
}
