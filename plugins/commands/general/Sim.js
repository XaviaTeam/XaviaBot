import fetch from "node-fetch";

const config = {
  "name": "sai",
  "aliases": ["s", "reku"],
  "description": "Chat with Sim",
  "usage": "<text>",
  "cooldown": 15,
  "permissions": [0, 1, 2],
  "credits": "WaifuCat",
  "extra": {}
};

async function onCall({message, args}) {
  const text = encodeURIComponent(args.join(" "));
  const url = `https://simsimi.fun/api/v2/?mode=talk&lang=ph&message=${text}&filter=false`;
  const apiResponse = await fetch(url);
  const responseJson = await apiResponse.json();

  if (responseJson.success) {
    message.reply(responseJson.success);
  } else {
    message.reply("Sorry, I couldn't understand your message.");
  }
}

export default {
  config,
  onCall,
};