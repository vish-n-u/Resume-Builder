import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// SDK initialization

// var ImageKit = require("imagekit");

// var imagekit = new ImageKit({
//     publicKey : "public_I3HmStf3cM8C2tD7Vna7U93J99g=",
//     privateKey : "private_YK05faX0dv******************",
//     urlEndpoint : "https://ik.imagekit.io/6zfx8ysru"
// });


export default imagekit