declare module "ffmpeg-extract-frames" {
  interface Options {
    input: string;
    output: string;
    offsets?: Array<number>;
    timestamps?: Array<number, string>;
    fps?: number;
    numFrames?: number;
    log?: () => void;
    ffmpegPath?: string;
  }
  const extractFrames: (opt: Options) => Promise<string> = (opt: Options) => {
    return opt.output;
  };

  export default extractFrames;
}
