import ffmpeg from "ffmpeg";

type Options = {
  isYoutube: boolean;
};
export const extractVideoFrames = async (input: string, output: string, opts?: Options) => {
  const video = await new ffmpeg(input);

  const seconds = video.metadata.duration?.seconds;
  video.setDisableAudio();
  video.setDisableVideo();
  video.setVideoFormat("mp4");
  console.log("Extracting frames");
  const options = opts?.isYoutube
    ? {
        frame_rate: 1000 / (seconds || 1000),
        size: "2%",
      }
    : {
        frame_rate: 1000 / (seconds || 1000),
        size: "1%",
      };

  await video.fnExtractFrameToJPG(output, options);
  console.log("Done");
};
