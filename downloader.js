import youtubedl from "youtube-dl-exec";
import Ffmpeg from "fluent-ffmpeg";

export function downloadVideo(url) {
  return new Promise((res, rej) => {
    youtubedl(url, {
      dumpSingleJson: true,
    }).then(data => {
      console.log("Video information got successfully!");
      const audio = data.formats.find(
        format =>
          (format.ext === "m4a" || format.ext === "webm") &&
          format.resolution === "audio only"
      );
      const video = data.formats.reverse().find(
        format =>
          // format.format.includes("4320p") ||
          // format.format.includes("2160p") ||
          // format.format.includes("1080p") ||
          format.format.includes("720p") ||
          format.format.includes("480p") ||
          format.format.includes("360p") ||
          format.format.includes("240p") ||
          format.format.includes("144p") ||
          format.format.includes("1280x720")
      );
      // combine audio and video
      const name = video.format + ".mp4";
      Ffmpeg()
        .input(video.url)
        .input(audio.url)
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
  });
}
