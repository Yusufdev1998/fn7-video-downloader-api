import express from "express";
import { downloadVideo } from "./downloader.js";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.post("/video", async (req, res) => {
  const body = req.body;
  const video_url = body?.url;
  if (!video_url) {
    return res.status(400).send("Please send video url!");
  }
  const name = await downloadVideo(video_url);
  res.send({ url: `http://${req.host}/download/${name}` });
});

app.get("/download/:url", (req, res) => {
  const url = req.params.url;
  const filePath = path.join(url); // Path to file
  res.download(filePath, "video.mp4", err => {
    if (err) {
      console.error(err);
      res.status(500).send("File not found");
    }    
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
