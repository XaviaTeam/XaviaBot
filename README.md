![XaviaBanner](https://i.ibb.co/K0ZSt89/XaviaFCB.png)

# Xavia

• A Facebook Chat Bot made by XaviaTeam<br />
• This Project will turn your Facebook account into a ***Facebook Chat Bot*** with a lot of Features

![illustration](https://i.ibb.co/Qfnpq0g/image-2022-07-23-011502426.png)

<hr />

## Requirements

• [NodeJS](https://nodejs.org/en/) v16.x

## Installation

• Import to [Replit](https://replit.com/github/XaviaTeam/XaviaBot) / [Glitch](https://glitch.com/edit/#!/import/github/XaviaTeam/XaviaBot)


__OR__


• Download Zip or Clone Project using

```bash
git clone https://github.com/XaviaTeam/XaviaBot.git
```

• Move to xavia directory

```bash
cd xavia
```


• Setup

 Login to browser and get `fbstate.json` by using [c3c-fbstate](https://github.com/c3cbot/c3c-fbstate) <br />
 Rename `fbstate.json` to `appstate.json` and move it to bot directory<br />
 Get your [imgbbAPIKEY](https://api.imgbb.com/)<br />
 

 Rename `.env.example` to `.env`<br />

 (Windows CMD)
```cmd
rename .env.example .env
```
(Linux/macOS Terminal)
```bash
mv -f .env.example .env
```

 Open `.env` and add a key to APPSTATE_SECRET_KEY<br /><br />

  .env
```
APPSTATE_SECRET_KEY=your_key_here
APPSTATE_PATH=./appstate.json
EMAIL=
PASSWORD=
OTPKEY=
PORT=your_port_number
YOUTUBE_DATA=your_youtube_data_v3_key
IMGBB_KEY=your_imgbb_key
```

 The key will be used to **encrypt** your `appstate.json` for better security when running on [replit](https://replit.com), [glitch](https://glitch.com), etc.<br />
 The port will be used to open a web server for 24/7 trick
<br /><br />

 Open `./config/config.main.json` and config your bot<br />
 Such as `MODERATORS` `PREFIX` `NAME`


• Install dependencies & Run

```bash
npm install && npm start
```
## Documentations
- See: [XaviaBot Documentation](https://github.com/XaviaTeam/XaviaBot/blob/main/DOCS.md)

## Contributing
• Pull requests are welcome.<br/>
• For major changes, please open an issue first to discuss what you would like to change.

## Authors

• **DimensityDU** (Lead Author):
[Github](https://github.com/RFS-ADRENO) -
[Facebook](https://www.facebook.com/Dungto213) -
[Youtube](https://www.youtube.com/channel/UCmL-430tKfEJYJ1rzBOCOjA) -
[Mail](mailto:xaviateam@protonmail.com)<br />
• **FuryCS** (Co-Author):
[Github](https://github.com/FuryCSProducer) -
[Discord](https://discord.gg/TrueSpades) -
[Facebook](https://facebook.com/FuryCSPianist)
<br /><br />
• Many thanks to TesterTeam for all the testing, feedbacks and the other Bot Projects ([c3cbot](https://github.com/c3cbot/legacy-c3cbot) - [miraibot](https://github.com/miraiPr0ject/miraiv2) - [kb2abot](https://github.com/kb2ateam/kb2abot-client)) that inspired me to create XaviaBot

## Donation

• Enjoy our Project? Give us a star or a donation!<br />
• Donate us via:<br />
&nbsp;&nbsp;&nbsp;» [Paypal](https://www.paypal.com/paypalme/dungto213)<br />
&nbsp;&nbsp;&nbsp;» [Momo](https://me.momo.vn/gMIMulsaUqsbf6iAiXt3)<br />
&nbsp;&nbsp;&nbsp;» [Buy me a Coffee!](https://www.buymeacoffee.com/dimensityDU)

## License
• This project is licensed under the MIT License<br />
• Go to [LICENSE](https://github.com/XaviaTeam/XaviaBot/blob/main/LICENSE) file
