import { useEffect } from "react";
import { useState } from "react"
import { Helmet } from "react-helmet";

import "../style/pages/player.css"

const apiUrl = "https://apiv2.simulatorradio.com/metadata/combined"
const audioUrl = "https://simulatorradio.stream/320"

export function Player() {
    const [dj, setDJ] = useState();
    const [nowPlaying, setNowPlaying] = useState();
    const [ticking, setTicking] = useState(true);
    const [count, setCount] = useState(0);
    const [audioUrlState, setAudioUrlState] = useState("");
    const [state, setState] = useState("paused");

    useEffect(() => {
        fetch(apiUrl)
            .then(
                (data) => {
                    data.json().then(res => {
                        setNowPlaying(res.now_playing)
                        setDJ(res.djs.now)
                    })
                },
                (error) => {
                    console.error(error);
                }
            )
    }, [count])

    useEffect(() => {
        const timer = setTimeout(() => ticking && setCount(count + 1), 3000)
        return () => clearTimeout(timer)
    }, [count, ticking])

    function stop() {
        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
            setState("play");
            return
        } else {
            setAudioUrlState("");
            setState("paused");
            return
        }
    }

    function playPause() {
        var player = document.querySelector("#audioPlayer")

        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
        }

        if (state === "paused") {
            setState("play")
            player.play();
            return
        } else {
            setState("paused")
            player.pause();
            return
        }
    }

    function live() {
        var player = document.querySelector("#audioPlayer")

        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
        }

        setState("play")
        player.load();
        player.play();
    }

    function rewind() {
        var player = document.querySelector("#audioPlayer")

        player.currentTime = player.currentTime - 10;
    }

    function fastForward() {
        var player = document.querySelector("#audioPlayer")
        var newTime = player.currentTime + 30;

        if (newTime < player.duration + 5) {
            player.currentTime = newTime;
        }
    }

    return <>
        <Helmet>
            <title>{'⏵⏸ | ' + nowPlaying?.title + ' - ' + nowPlaying?.artist + ' | ReactRadio'}</title>
        </Helmet>
        <section id="player" onLoad={() => { setTicking(true) }}>
            <div className="dj">
                <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + dj?.avatar} alt="" className="profilePicture" />
                <div className="about">
                    <span className="title">{dj?.displayname}</span>
                    <span className="subTitle">{dj?.details}</span>
                </div>
            </div>
            <div className="container">
                <div className="player">
                    <div className="art" onClick={() => { stop() }}>
                        <img src={nowPlaying?.art} alt="" />
                    </div>
                    <div className="info">
                        <span className="title">{nowPlaying?.title}</span>
                        <span className="subTitle">{nowPlaying?.artists}</span>
                    </div>
                </div>
                <div className="controls">
                    <button className="material-symbols-outlined" onClick={() => { rewind() }}  disabled={document.querySelector("#audioPlayer")?.currentTime < 10} title="Rewind 10s">replay_10</button>
                    <button className="material-symbols-outlined" onClick={() => { live() }} title="Live">stream</button>
                    
                    {state === "paused" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Play">play_circle</button>}
                    {state === "play" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Pause">pause_circle</button>}

                    <button className="material-symbols-outlined" onClick={() => { stop() }} title="Stop">stop_circle</button>
                    <button className="material-symbols-outlined" onClick={() => { fastForward() }} disabled={document.querySelector("#audioPlayer")?.currentTime + 30 > document.querySelector("#audioPlayer")?.duration + 5} title="FastForward 30s">forward_30</button>
                </div>
            </div>
            {/* <div className="mobile"></div> */}
            <img src={nowPlaying?.art} alt="" className="background" />
        </section>
        <audio src={audioUrlState} id="audioPlayer" autoPlay="autoplay" crossOrigin="anonymous" />
    </>
}