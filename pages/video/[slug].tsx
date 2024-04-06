import { NextPageContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ytdl from "ytdl-core";
import styles from "@/styles/Video.module.css";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export interface VideoProps {
  valid: boolean;
  thumbnail: string;
  Name: string;
  formats: Format[];
}
export interface Format {
  itag: number;
  url: string;
  qualityLabel: string;
  hasAudio: boolean;
  hasVideo: boolean;
  bitrate?: number;
  audioBitrate?: number;
  width?: number;
  height?: number;
  contentLength: string;
  container: string;
  videoCodec?: string;
  audioCodec?: string;
  quality: any;
  audioQuality?: string;
}
export interface CombinedProps {
  video: number;
  audio: number;
}

export default function Video(props: VideoProps) {
  const router = useRouter();
  const id = router.query.slug;
  useEffect(() => {
    if (!props.valid) {
      router.push("/");
    }
    document.title = `Download - ${props.Name}`;
  }, []);
  const videoFormats = props.formats.filter((format) => format.hasVideo && !format.hasAudio);
  const audioFormats = props.formats.filter((format) => format.hasAudio && !format.hasVideo);
  const [propsFormat, setPropsFormat] = useState<CombinedProps>({ video: videoFormats[0].itag, audio: audioFormats[0].itag });
  console.log("Props", propsFormat);
  const toDownload = async () => {
    document.location.href = `/api/download?id=${id}&firstFormatIndex=${propsFormat.video}&secondFormatIndex=${propsFormat.audio}`;
  };
  const changeVideo = (event: SelectChangeEvent<number>, type: "video" | "audio") => {
    if (type === "video") {
      setPropsFormat({ ...propsFormat, video: event.target.value as number });
    } else {
      setPropsFormat({ ...propsFormat, audio: event.target.value as number });
    }
  };
  return (
    <div className={`${styles.Info}`}>
      <div className={`${styles.data}`}>
        <div className={`${styles.Name}`}>
          Name :{" "}
          <a target="_blank" href={`https://youtube.com/watch?v=${id}`}>
            {props.Name}
          </a>
        </div>
        <img className={`${styles.thumbnail}`} src={props.thumbnail} alt="Thumbnail" />
        <table className={`${styles.tableau}`}>
          <thead>
            <tr>
              <td>Quality</td>
              <td>Size</td>
              <td>Container</td>
              <td>Video Codec</td>
              <td>Audio Codec</td>
              <td>Download</td>
            </tr>
          </thead>
          <tbody>
            {props.formats.map((format, index) => (
              <tr>
                <td>{format.qualityLabel}</td>
                <td>{format.contentLength}</td>
                <td>{format.container}</td>
                <td>{format.videoCodec}</td>
                <td>{format.audioCodec}</td>
                <td>
                  <a target="_blank" href={format.url}>
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`${styles.sdata}`}>
          <h1>Combined Download</h1>
          <div className={`${styles.selector}`}>
            <FormControl fullWidth>
              <InputLabel>Video Item</InputLabel>
              <Select
                // labelId=""
                onChange={(event) => changeVideo(event, "video")}
                label="Video Item"
                style={{ backgroundColor: "white" }}
                value={propsFormat.video}
              >
                {videoFormats.map((format) => (
                  <MenuItem value={format.itag}>
                    {format.qualityLabel} - {format.container}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Audio Item</InputLabel>
              <Select
                // labelId=""
                onChange={(event) => changeVideo(event, "audio")}
                label="Audio Item"
                style={{ backgroundColor: "white" }}
                value={propsFormat.audio}
              >
                {audioFormats.map((format) => (
                  <MenuItem value={format.itag}>
                    {format.audioCodec} - {format.audioQuality}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Button onClick={toDownload} variant="contained">
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any): Promise<{ props: VideoProps }> {
  console.log("Get Info for key", context.query.slug);
  const videoId = context.query.slug;
  const isValid = await ytdl.validateID(videoId);
  if (!isValid) {
    return {
      props: {
        valid: false,
        thumbnail: "",
        Name: "",
        formats: [],
      },
    };
  }
  const info = await ytdl.getInfo(videoId);
  info.videoDetails.thumbnails.sort((a, b) => b.width - a.width);
  const thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;
  const formats = info.formats;

  return {
    props: {
      valid: true,
      thumbnail: thumbnail ?? "",
      Name: info.videoDetails.title ?? "",
      formats: formats,
    },
  };
}
