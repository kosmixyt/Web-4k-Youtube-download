import Ffmpeg from "fluent-ffmpeg";
import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";

type Data = {
  name: string;
};

Ffmpeg.setFfmpegPath("C:/ffmpeg.exe");

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const id = req.query.id;
  const firstFormatIndex = req.query.firstFormatIndex;
  const secondFormatIndex = req.query.secondFormatIndex;
  const valid = ytdl.validateURL(`https://www.youtube.com/watch?v=${id}`);
  if (!valid) {
    return res.status(400).json({ name: "Invalid URL" });
  }
  // ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`).then((info) => {
  //   const videoFormats = info.formats.filter((format) => format.hasVideo && !format.hasAudio);
  //   const audioFormats = info.formats.filter((format) => format.hasAudio && !format.hasVideo);
  //   const video = videoFormats[parseInt(firstFormatIndex as string)];
  //   const audio = audioFormats[parseInt(secondFormatIndex as string)];
  //   const name = `${info.videoDetails.title}.mp4`;
  //   res.setHeader("Content-Disposition", `attachment; filename=${name}`);
  //   ytdl(`https://www.youtube.com/watch?v=${id}`, {
  //     filter: (format) => format.itag === video.itag || format.itag === audio.itag,
  //   }).pipe(res);
  // });
  const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
  const first = info.formats.find((format) => format.itag === parseInt(firstFormatIndex as string));
  const second = info.formats.find((format) => format.itag === parseInt(secondFormatIndex as string));
  if (!first || !second) {
    return res.status(400).json({ name: "Invalid format cannot find" });
  }
  if ((first.hasAudio && first.hasVideo) || (second.hasAudio && second.hasVideo) || first.hasVideo == second.hasVideo) {
    return res.status(400).json({ name: "Invalid format" });
  }

  console.log("first", first.url);
  console.log("second", second.url);

  res.setHeader("Content-Disposition", `attachment; filename=${info.videoDetails.title}.mp4`);
  const command = Ffmpeg()
    .input(first.url)
    .input(second.url)
    .outputOptions(["-c:v copy", "-c:a copy"])
    .format("mp4")
    .outputOption("-movflags frag_keyframe+empty_moov")
    .on("progress", (progress) => {
      // console.log("Processing: " + progress);
    })
    .on("stderr", (stderrLine) => {
      // console.log("Stderr output: " + stderrLine);
    })
    .on("stdout", (stdoutLine) => {
      // console.log("Stdout output: " + stdoutLine);
    })
    .on("start", (commandLine) => {
      // console.log("Spawned Ffmpeg with command: " + commandLine);
    })
    .pipe(res, { end: true });
}
