const config = {
  name: "uptime",
  aliases: ["upt"],
  credits: "XaviaTeam",
};

async function onCall({ message }) {
  const uptimeInSeconds = process.uptime();
  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  try {
    const replyMessage = await message.reply(`𝘽𝙤𝙩 đ𝙖̃ 𝙝𝙤𝙖̣𝙩 đ𝙤̣̂𝙣𝙜 đ𝙪̛𝙤̛̣𝙘  
${hours} 𝐆𝐢𝐨̛̀ ${minutes} 𝐏𝐡𝐮́𝐭 ${seconds} 𝐆𝐢𝐚̂𝐲`);
    console.log(replyMessage);
  } catch (error) {
    console.error(error);
  }
}

export default {
  config,
  onCall,
};
