import { Fragment, useCallback, useEffect } from "react";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Link, useSearchParams } from "react-router-dom";

import "../style/pages/player.css";
import "../style/pages/switcher.css";
import "../style/pages/history.css";
import "../style/pages/timetable.css";
import { stations } from "../App";

export function Player(props) {
  const [params, setParams] = useSearchParams();
  const [dj, setDJ] = useState();
  const [nowPlaying, setNowPlaying] = useState();
  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);
  const [audioUrlState, setAudioUrlState] = useState("");
  const [state, setState] = useState("paused");
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (params.get("oled") !== null) {
      document.body.classList.add("oled");
    } else if (document.body.classList.contains("oled")) {
      document.body.classList.remove("oled");
    }
  }, [params]);

  useEffect(() => {
    fetch(props.apiUrl)
      .then(
        (data) => {
          data.json().then((res) => {
            let outNow = {};
            let outDJ = {};

            if (res?.now_playing?.title) {
              outNow.title = res?.now_playing?.title;
            } else if (res?.title) {
              outNow.title = res.title;
            } else if (res?.data?.title) {
              outNow.title = res.data.title;
            } else {
              outNow.title = "";
            }

            if (res?.now_playing?.artists) {
              outNow.artists = res?.now_playing?.artists;
            } else if (res?.artist) {
              outNow.artists = res.artist;
            } else if (res?.data?.artist) {
              outNow.artists = res.data.artist;
            } else {
              outNow.artists = "";
            }

            if (res?.now_playing?.art) {
              outNow.art = res?.now_playing?.art;
            } else if (res?.art?.large) {
              outNow.art = res.art.large;
            } else if (res?.data?.album_art) {
              outNow.art = res.data.album_art;
            } else {
              outNow.art = "";
            }

            if (!props.apiLive) {
              if (res?.djs?.now?.displayname) {
                outDJ.displayname = res.djs.now.displayname;
              }

              if (res?.djs?.now?.avatar) {
                outDJ.avatar = res.djs.now.avatar;
              }

              if (res?.djs?.now?.details) {
                outDJ.details = res.djs.now.details;
              }

              setDJ(outDJ);
            } else {
              fetch(props.apiLive).then((data) => {
                data.json().then((res) => {
                  if (res?.data?.user?.name) {
                    outDJ.displayname = res.data.user.name;
                  }

                  if (res?.data?.image) {
                    outDJ.avatar = res.data.image;
                  }

                  if (res?.data?.description) {
                    outDJ.details = res.data.description;
                  }

                  setDJ(outDJ);
                });
              });
            }

            setNowPlaying(outNow);
          });
        },
        (error) => {
          console.error(error);
        }
      )
      .catch((error) => {
        console.error(error);
      });
  }, [count, props.apiUrl, props.apiLive]);

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
      <Helmet defer={false}>
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
            {dj?.avatar && !props.apiLive && (
              <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + dj?.avatar} alt={dj?.avatar + "'s avatar"} className="profilePicture" />
            )}
            {dj?.avatar && props.apiLive && <img src={dj?.avatar} alt={dj?.avatar + "'s avatar"} className="profilePicture" />}
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
                  className=" large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Play"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
                  </svg>
                </button>
              )}
              {state === "play" && (
                <button
                  className=" large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Pause"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
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
                className=""
                onClick={() => {
                  rewind();
                }}
                disabled={document.querySelector("#audioPlayer")?.currentTime < 10}
                title="Rewind 10s"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.11-.32.04-.29.04-.48v-.97z" />
                </svg>
              </button>
              <button
                className=""
                onClick={() => {
                  live();
                }}
                title="Live"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <circle cx="20" cy="12" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <circle cx="12" cy="20" r="2" />
                  <path d="M10.05 8.59L6.03 4.55h-.01l-.31-.32-1.42 1.41 4.02 4.05.01-.01.31.32zm3.893.027l4.405-4.392L19.76 5.64l-4.405 4.393zM10.01 15.36l-1.42-1.41-4.03 4.01-.32.33 1.41 1.41 4.03-4.02zm9.75 2.94l-3.99-4.01-.36-.35L14 15.35l3.99 4.01.35.35z" />
                  <circle cx="12" cy="4" r="2" />
                </svg>
              </button>

              {state === "paused" && (
                <button
                  className=" large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Play"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M10 16.5l6-4.5-6-4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </button>
              )}
              {state === "play" && (
                <button
                  className=" large"
                  onClick={() => {
                    playPause();
                  }}
                  title="Pause"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z" />
                  </svg>
                </button>
              )}

              <button
                className=""
                onClick={() => {
                  stop();
                }}
                title="Stop"
              >
                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24">
                  <g>
                    <rect fill="none" height="24" />
                  </g>
                  <g>
                    <g>
                      <rect height="8" width="8" x="8" y="8" />
                      <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8c0-4.41,3.59-8,8-8 s8,3.59,8,8C20,16.41,16.41,20,12,20z" />
                    </g>
                  </g>
                </svg>
              </button>
              <button
                className=""
                onClick={() => {
                  fastForward();
                }}
                disabled={document.querySelector("#audioPlayer")?.currentTime + 30 > document.querySelector("#audioPlayer")?.duration + 5}
                title="FastForward 30s"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2zm-7.46 2.22c-.06.05-.12.09-.2.12s-.17.04-.27.04c-.09 0-.17-.01-.25-.04s-.14-.06-.2-.11-.1-.1-.13-.17-.05-.14-.05-.22h-.85c0 .21.04.39.12.55s.19.28.33.38.29.18.46.23.35.07.53.07c.21 0 .41-.03.6-.08s.34-.14.48-.24.24-.24.32-.39.12-.33.12-.53c0-.23-.06-.44-.18-.61s-.3-.3-.54-.39c.1-.05.2-.1.28-.17s.15-.14.2-.22.1-.16.13-.25.04-.18.04-.27c0-.2-.04-.37-.11-.53s-.17-.28-.3-.38-.28-.18-.46-.23-.37-.08-.59-.08c-.19 0-.38.03-.54.08s-.32.13-.44.23-.23.22-.3.37-.11.3-.11.48h.85c0-.07.02-.14.05-.2s.07-.11.12-.15.11-.07.18-.1.14-.03.22-.03c.1 0 .18.01.25.04s.13.06.18.11.08.11.11.17.04.14.04.22c0 .18-.05.32-.16.43s-.26.16-.48.16h-.43v.66h.45c.11 0 .2.01.29.04s.16.06.22.11.11.12.14.2.05.18.05.29c0 .09-.01.17-.04.24s-.08.11-.13.17zm3.9-3.44c-.18-.07-.37-.1-.59-.1s-.41.03-.59.1-.33.18-.45.33-.23.34-.29.57-.1.5-.1.82v.74c0 .32.04.6.11.82s.17.42.3.57.28.26.46.33.37.1.59.1.41-.03.59-.1.33-.18.45-.33.22-.34.29-.57.1-.5.1-.82v-.74c0-.32-.04-.6-.11-.82s-.17-.42-.3-.57-.28-.26-.46-.33zm.01 2.57c0 .19-.01.35-.04.48s-.06.24-.11.32-.11.14-.19.17-.16.05-.25.05-.18-.02-.25-.05-.14-.09-.19-.17-.09-.19-.12-.32-.04-.29-.04-.48v-.97c0-.19.01-.35.04-.48s.06-.23.12-.31.11-.14.19-.17.16-.05.25-.05.18.02.25.05.14.09.19.17.09.18.12.31.04.29.04.48v.97z" />
                </svg>
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
        <img src={nowPlaying?.art} alt="" className="background animated" />
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
                    <Link to={item.url + (document.body.classList.contains("oled") ? "?oled" : "")}>{item.station}</Link>
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
  const [api, setAPI] = useState();
  const [history, setHistory] = useState();
  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setAPI((url) => {
      if (props.apiHistoryUrl === url) {
        setHistory();
        return props.apiHistoryUrl;
      } else {
        return url;
      }
    });

    fetch(props.apiHistoryUrl + "7").then(
      (data) => {
        data.json().then((res) => {
          if (res.length) {
            setHistory(res);
          } else if (res?.data) {
            setHistory(res.data);
          }
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }, [count, props.apiHistoryUrl, api]);

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
                    {item?.album_art && <img src={item.album_art} alt="" />}
                    {item?.art?.large && <img src={item.art.large} alt="" />}
                    {!item?.art?.large && item?.art?.large !== null && <img src={item.art} alt="" />}
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
