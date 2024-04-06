import Image from "next/image";
import { IM_Fell_French_Canon, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Button, TextField } from "@mui/material";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const variantDefaults = [
  "youtube.com",
  "youtu.be",
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube.com",
  "www.youtu.be",
  "www.m.youtube.com",
  "www.music.youtube.com",
  "m.youtube.com",
];
export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=z0Wq1ZjdKwY");
  useEffect(() => {
    navigator.clipboard.readText().then((text) => {
      if (variantDefaults.some((variant) => text.includes(variant))) setUrl(text);
    });
  }, []);
  const navig = () => {
    try {
      var vurl = new URL(url);
      const hostn = vurl.hostname;
      if (!variantDefaults.includes(hostn)) {
        console.log(hostn);
        throw new Error("Invalid Hostname");
      }
    } catch (e) {
      console.log(e);
      return toast.error("Invalid url");
    }

    router.push(`/video/${vurl.searchParams.get("v")}`);
  };

  return (
    <>
      <ToastContainer />
      <div className={`${styles.container}`}>
        <div className={`${styles.inputctn}`}>
          <TextField
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            label="Youtube video Url"
            variant="filled"
            className={`${styles.videoinput}`}
          />
          <Button onClick={navig} className={`${styles.btn}`} variant="contained">
            Download
          </Button>
        </div>
      </div>
    </>
  );
}
