import ffmpeg from "ffmpeg";

export const extractVideoFrames = async (input: string, output: string) => {
  const video = await new ffmpeg(input);

  const seconds = video.metadata.duration?.seconds;
  video.setDisableAudio();
  video.setDisableVideo();
  video.setVideoFormat("mp4");
  console.log("Extracting frames");
  await video.fnExtractFrameToJPG(output, {
    frame_rate: 1000 / (seconds || 1000),
    size: "10%",
  });
  console.log("Done");
};
