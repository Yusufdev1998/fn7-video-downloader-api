import express from "express";
import {
  downloadVideo,
  getVideoInfromation,
  youtubeVideoFormats,
} from "./downloader.js";
import path from "path";
import cors from "cors";
import fs from "fs";
import axios from "axios";

function downloadThumbnail(url, path) {
  return new Promise((res, rej) => {
    axios({
      url,
      method: "GET",
      responseType: "stream",
    })
      .then(response => {
        response.data.pipe(fs.createWriteStream(path));
        response.data.on("end", () => {
          res(path);
          console.log("downloaded");
        });
      })
      .catch(err => rej(err));
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.use("/public", express.static("./public"));
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.post("/video", async (req, res) => {
  const body = req.body;
  const video_url = body?.url; //
  if (!video_url) {
    return res.status(400).send("Please send video url!");
  }
  const videoInfo = await getVideoInfromation(video_url);
  const isInstagram = video_url.startsWith("https://www.instagram.com");
  let thumb = videoInfo.thumbnail;
  if (isInstagram) {
    const url = videoInfo.thumbnail;
    const path = "./public/" + videoInfo.title + ".jpg";
    await downloadThumbnail(url, path);
    thumb = `http://localhost:8080/${path.slice(2)}`;
  }
  res.send({
    title: videoInfo.title,
    thumbnail: thumb,
    uploader: videoInfo.uploader,
    duration: videoInfo.duration,
    availableResolutions: youtubeVideoFormats
      .map(format => {
        const info = videoInfo.formats.find(
          f =>
            f.resolution === format.resolution ||
            f.resolution.split("x").reverse().join("x") === format.resolution
        );

        return {
          ...format,
          url: info?.url,
        };
      })
      .filter(t => t.url)
      .reverse(),
  });
});

app.post("/download", async (req, res) => {
  const youtube_url = req.body.youtube_url;
  const video_url = req.body.video_url;
  await downloadVideo(youtube_url, video_url);
  const videoPath = path.resolve("video.mp4");

  res.download(videoPath, "video.mp4", err => {
    if (err) {
      console.error(err);
      res.status(500).send("File not found");
    }
    fs.unlink("video.mp4", err => {
      if (err) {
        console.log(err);
      }
    });
    fs.unlink("audio.m4a", err => {
      if (err) {
        console.log(err);
      }
    });
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
