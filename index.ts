import { PNG } from "pngjs";
import fs from "fs";
import * as cp from 'child_process'

const MAX_IMG_INDEX = 1;

const shader =
  (a: number, b: number) => (Math.sin(a) > Math.sin(b) ? a : b);

const loadImages = () => {
  console.info("loading images...");

  return fs.readdirSync("./in").map((imgSrc) => {
    const imgFile = fs.readFileSync(`./in/${imgSrc}`);
    const res = PNG.sync.read(imgFile);

    return res;
  });
};

const processImages = (imgs: PNG[]) => {
  console.info("processing images...");

  return imgs.map((img, imgIdx) => {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (img.width * y + x) << 2;
        const red = idx;
        const green = idx + 1;
        const blue = idx + 2;

        const nextImgIdx = imgIdx + 1;

        for (let i = nextImgIdx; i < nextImgIdx + MAX_IMG_INDEX; i++) {
          const compImg = imgs[i];
          const compPixCoeff = (((MAX_IMG_INDEX - (i - nextImgIdx)) / MAX_IMG_INDEX)  / 2 + 0.5);

          if (!compImg) continue;

          img.data[red] = shader(img.data[red], compImg.data[red] * compPixCoeff);
          img.data[green] = shader(img.data[green], compImg.data[green] * compPixCoeff);
          img.data[blue] = shader(img.data[blue], compImg.data[blue] * compPixCoeff);
        }
      }
    }

    console.info(`image ${imgIdx + 1} successfully processed`);

    return img;
  });
};

const writeImages = (imgs: PNG[]) => {
  console.info("writing images...");

  return imgs
    .map((img) => PNG.sync.write(img))
    .map((buff, i) =>
      fs.writeFileSync(`./out/${i.toString().padStart(3, "0")}.png`, buff)
    );
};

const writeVideo = () => {
  return new Promise((resolve, reject) => {
    console.info("writing video...");

    // cp.exec('ffmpeg -r 1/2 -i ./out/%03d.png -c:v libx264 -vf "fps=10,format=yuv420p" out.mp4')
    //   .once('message', console.info)
    //   .once('error', reject)
    //   .once('close', resolve);
    resolve(undefined);
  })
}

const done = () => console.info('job successfully done');

(function main() {
  Promise
    .resolve(loadImages())
    .then(processImages)
    .then(writeImages)
    .then(writeVideo)
    .then(done)
    .catch((error) => {
      console.info('job failed. reason:');
      console.error(error);
    });
})();
