"use client";

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoJSPlayer = ({
  src, // Video URL (MP4, HLS)
  poster, // Poster image
  subtitles = [], // Array of { src, srclang, label, default }
  playbackRates = [0.5, 1, 1.5, 2],
  width = "100%",
  height = "auto",
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: "auto",
      playbackRates,
      poster,
      sources: [
        {
          src,
          type: src.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
        },
      ],
    });

    // Add subtitles if any
    subtitles.forEach((track) => {
      playerRef.current.addRemoteTextTrack(track, false);
    });

    // Example event listeners
    playerRef.current.on("play", () => console.log("Video playing"));
    playerRef.current.on("pause", () => console.log("Video paused"));
    playerRef.current.on("ended", () => console.log("Video ended"));

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, subtitles, playbackRates]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        style={{ width, height }}
      />
    </div>
  );
};

export default VideoJSPlayer;
