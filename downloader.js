import youtubedl from "youtube-dl-exec";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";

export async function getVideoInfromation(url) {
  const json = await youtubedl(url, {
    dumpSingleJson: true,
  });
  // fs.writeFile("data.json", JSON.stringify(json, null, 2), err => {
  //   console.log(err);
  // });
  return json;
}

export function downloadVideo(url, video_url) {
  return new Promise(async (res, rej) => {
    await downloadAudio(url);
    console.log("Audio got!");
    // combine audio and video
    const name = "video" + ".mp4";
    Ffmpeg()
      .input(video_url)
      .input("audio.m4a")
      .outputOptions(["-c:v copy", "-c:a aac"])
      .save(name)
      .on("end", () => {
        console.log("✅ Audio and video merged successfully!");
        res(name);
      })
      .on("error", err => {
        rej(err);
        console.error("❌ Error:", err);
      });
  });
}

const downloadAudio = async url => {
  await youtubedl(url, {
    extractAudio: true,
    audioFormat: "aac", // or 'm4a'
    output: "audio",
  });
};

export const youtubeVideoFormats = [
  {
    name: "144p",
    resolution: "256x144",
  },
  {
    name: "240p",
    resolution: "426x240",
  },
  {
    name: "360p",
    resolution: "640x360",
  },
  {
    name: "480p",
    resolution: "854x480",
  },
  {
    name: "720p (HD)",
    resolution: "1280x720",
  },
  {
    name: "1080p (Full HD)",
    resolution: "1920x1080",
  },
  {
    name: "1440p (2K)",
    resolution: "2560x1440",
  },
  {
    name: "2160p (4K)",
    resolution: "3840x2160",
  },
  {
    name: "4320p (8K)",
    resolution: "7680x4320",
  },
];
