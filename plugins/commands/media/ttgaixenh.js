const config = {
  name: "gái",
  aliases: ["bitch", "gaitiktik"], 
  description: "random",
  version: "1.0.0",
  permissions: [0, 1, 2],
  credits: "MHung"
};

const images = [
  "https://i.imgur.com/x6m7xuB.mp4",
  "https://i.imgur.com/VIaxhYL.mp4",
  "https://i.imgur.com/cacElle.mp4",
  "https://i.imgur.com/V2k8Mc2.mp4",
  "https://i.imgur.com/es04r5F.mp4",
  "https://i.imgur.com/qC4Cnyv.mp4",
  "https://i.imgur.com/hS2rvB2.mp4",
  "https://i.imgur.com/0IB9Ge4.mp4",
  "https://i.imgur.com/hRISUCk.mp4",
  "https://i.imgur.com/RtnnKhh.mp4",
  "https://i.imgur.com/VBjOe68.mp4",
  "https://i.imgur.com/opYNe3j.mp4",
  "https://i.imgur.com/yrM30Pr.mp4",
  "https://i.imgur.com/APp44uh.mp4",
  "https://i.imgur.com/SGO4hlS.mp4",
  "https://i.imgur.com/w2Px3si.mp4",
  "https://i.imgur.com/R2FDLL9.mp4",
  "https://i.imgur.com/lFLK5e6.mp4",
  "https://i.imgur.com/lFLK5e6.mp4",
  "https://i.imgur.com/e877bob.mp4",
  "https://i.imgur.com/rJpC26p.mp4",
  "https://i.imgur.com/2kZe0V2.mp4",
  "https://i.imgur.com/zHJs5l7.mp4",
  "https://i.imgur.com/Lcq24bb.mp4",
  "https://i.imgur.com/jG9fSc2.mp4",
  "https://i.imgur.com/OKBJsnL.mp4",
  "https://i.imgur.com/Lb8cOYm.mp4",
  ""
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