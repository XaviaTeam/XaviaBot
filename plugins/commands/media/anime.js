const config = {
  name: "anime",
  aliases: ["vdanime", "wibu"], 
  description: "random vd anime",
  version: "1.0.0",
  permissions: [0, 1, 2],
  credits: "MHung"
};

const images = [
  "https://i.imgur.com/qhW5q8B.mp4",
  "https://i.imgur.com/XnLo7CT.mp4",
  "https://i.imgur.com/JVsxCIs.mp4",
  "https://i.imgur.com/CXoVTXZ.mp4",
  "https://i.imgur.com/KgzENiZ.mp4",
  "https://i.imgur.com/quDlDxg.mp4",
  "https://i.imgur.com/GjWLJsT.mp4",
  "https://i.imgur.com/sFgSSpL.mp4",
  "https://i.imgur.com/2FVb9ZX.mp4",
  "https://i.imgur.com/YD5UNQM.mp4",
  "https://i.imgur.com/uVTyWvo.mp4",
  "https://i.imgur.com/N4ZpCcb.mp4",
  "https://i.imgur.com/yaRItGy.mp4",
  "https://i.imgur.com/YnJTQYR.mp4",
  "https://i.imgur.com/7ERDzen.mp4",
  "https://i.imgur.com/eiyTdhR.mp4",
  "https://i.imgur.com/yjn6tb3.mp4",
  "https://i.imgur.com/3nAGNdh.mp4",
  "https://i.imgur.com/n8t6t5H.mp4",
  "https://i.imgur.com/tajwFJy.mp4",
  "https://i.imgur.com/98XaZyE.mp4",
  "https://i.imgur.com/uNz5sqk.mp4",
  "https://i.imgur.com/IHh4b9f.mp4",
  "https://i.imgur.com/WGwj3Re.mp4",
  "https://i.imgur.com/II6UQtr.mp4",
  "https://i.imgur.com/II6UQtr.mp4",
  "https://i.imgur.com/1RhNizd.mp4",
  "https://i.imgur.com/b9pKNtj.mp4",
  "https://i.imgur.com/w8Fkd6M.mp4",
  "https://i.imgur.com/ND2rri7.mp4",
  "https://i.imgur.com/D2AV2hq.mp4",
  "https://i.imgur.com/hwRVkpF.mp4",
  "https://i.imgur.com/Xx4J7UV.mp4",
  "https://i.imgur.com/U35Skgo.mp4",
  "https://i.imgur.com/ugjvIoa.mp4",
  "https://i.imgur.com/e3iRMco.mp4",
  "https://i.imgur.com/ue1BRKX.mp4",
  "https://i.imgur.com/Viai7zf.mp4",
  "https://i.imgur.com/qn78JYW.mp4",
  "https://i.imgur.com/XSGm1Gb.mp4",
  "https://i.imgur.com/oWhyANG.mp4",
  "https://i.imgur.com/PLr1wUb.mp4",
  "https://i.imgur.com/GGkrgqu.mp4",
  "https://i.imgur.com/UvBPDCd.mp4",
  "https://i.imgur.com/bPeBAD2.mp4",
  "https://i.imgur.com/2SxLwjT.mp4",
  "https://i.imgur.com/pJw7B4q.mp4",
  "https://i.imgur.com/muLzV4u.mp4",
  "https://i.imgur.com/8kuq3l2.mp4",
  "https://i.imgur.com/fmIY25N.mp4",
  "https://i.imgur.com/vN6Alqd.mp4",
  "https://i.imgur.com/YzhS54t.mp4"
];
function getRandomIndex(arr) {
  const max = arr.length - 1;
  const min = 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function onCall({ message }) {
  try {
    if (images.length === 0) return message.reply(getLang("error"));

    const index = getRandomIndex(images);
    const image = images[index];

    const imageStream = await global.getStream(image);
    await message.reply({
      attachment: [imageStream]
    });
  } catch (e) {
    message.reply(getLang("error"));
  }

  return;
}

export default {
  config,
  onCall
}