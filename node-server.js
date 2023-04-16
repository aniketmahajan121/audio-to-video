import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import outputConfig from './outputConfig.json' assert { type: "json" };

const start = async () => {
  const compositionId = "TextToVideo";

  const entry = "./src/index.ts";
  console.log("Creating a Webpack bundle of the video");
  const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
    // If you have a Webpack override, make sure to add it here
    webpackOverride: (config) => config,
  });

  const inputProps = outputConfig
  console.log('Assets using to generate video', inputProps)

  const comps = await getCompositions(bundleLocation, {
    inputProps,
  });

  const composition = comps.find((c) => c.id === compositionId);

  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
  }

  const outputLocation = `out/${compositionId}.mp4`;
  console.log("Attempting to render:", outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
  });
  console.log("Render done!, Closing Process");
};

await start();
process.exit()