import { join } from 'path'
import fluent from 'fluent-ffmpeg';
import ffmpeg from 'ffmpeg-static';
import stringSimilarity from 'string-similarity'
import ytdl from 'ytdl-core';

const config = {
    name: 'bandori',
    aliases: ['bangdream', 'band'],
    version: '1.0.2',
    description: 'Play BanG Dream! songs, garupa PICO videos, and more!',
    usage: '<song> | <pico> | <pull>',
    cooldown: 5,
    credits: "XaviaTeam",
    extra: {
        pullRate: {
            _SPECIAL: 2,
            _4STARS: 20,
            _3STARS: 100,
            _2STARS: 300,
        },
        pullCost: 500,
        refund: 150
    }
}

const Bands = ["Poppin'Party", "Afterglow", "Pastel*Palettes", "Roselia", "Hello, Happy World!", "Morfonica", "RAISE A SUILEN"];
const Picos = ["PICO", "PICO-OHMORI", "PICO-FEVER"];

const onLoad = async () => {
    if (!global.hasOwnProperty('bandori')) global.bandori = {};
    if (!global.bandori.hasOwnProperty('data_audio')) global.bandori.data_audio = {};
    global.bandori.isReady = false;

    const baseRAW = 'https://raw.githubusercontent.com/RFS-ADRENO/bandori-data/main/';
    try {
        fluent.setFfmpegPath(ffmpeg);
        for (const band of Bands) {
            const bandRAW = baseRAW + 'data_audio/' + band.replace(/ /g, '_').replace(/\*/g, '-') + '.json';
            const data = await GET(bandRAW);
            global.bandori.data_audio[band] = data.data;
        }

        const picoRAW = baseRAW + 'PICOS.json';
        const pico = await GET(picoRAW);

        global.bandori.picos = pico.data;

        const cardsRAW = baseRAW + 'cards.json';
        const cards = await GET(cardsRAW);

        global.bandori.cards = cards.data
            .filter(card => card.rarity != 1)
            .filter(card => card.rarity == 2 || card.skill_name !== null)
            .filter(card => card.name !== null);

        const special_cardsRAW = baseRAW + 'special_cards.json';
        const special_cards = await GET(special_cardsRAW);

        global.bandori.special_cards = special_cards.data;

        global.bandori.isReady = true;
    } catch (error) {
        console.error(error);
    }
}

const langData = {
    'en_US': {
        "song.chooseBand": "Choose a band:\n{bands}",
        "song.chooseBand.invalid": "Invalid choice.",
        "song.chooseSong": "{msg}\n⇒ Reply the song number.",
        "song.chooseSong.invalid": "Invalid choice.",
        "song.chooseSong.noAudioAvailable": "No audio available.",
        "song.chooseAudioSource": "{msg}\n⇒ Reply with the audio source number to play.",
        "song.chooseAudioSource.invalid": "Invalid choice.",
        "song.search.noResult": "No song found.",
        "pico.choosePart": "Choose a part:\n{parts}",
        "pico.choosePart.invalid": "Invalid choice.",
        "pico.chooseEpisode": "[ {part} ]\nTotal: {total} eps\n⇒ Reply the episode you want to watch.",
        "pico.chooseEpisode.invalid": "Invalid choice.",
        "pull.noData": "Your data is not ready...",
        "pull.notEnoughMoney": "You need {pullCost} XC to pull.",
        "pull.alreadyHave": "Pulled the card you already have, got {refund} XC back.",
        "pull.cardType._0": "You got a {rarity} stars card! (id: {id})",
        "pull.cardType._1": "You got a Special cards! (id: {id})",
        "pull.result": "\nName: {name} ({attribute})\nSkill: {skill_name}",
        "inventory.noData": "Your data is not ready...",
        "inventory.data": "=== ⌈ Bandori ⌋ ===\n • Total: {_total}\n • Special: {_SPECIAL}\n • 4 stars: {_4STARS} ({_4STARS_AWAKENED} awakened)\n • 3 stars: {_3STARS} ({_3STARS_AWAKENED} awakened)\n • 2 stars: {_2STARS}",
        "any.error": "An error occurred.",
        "downloading": "Downloading...",
        "help": `=== BANDORI HELP ===\n${config.name} song <song name> - Play a song.\n${config.name} song - Choose a song.\n${config.name} pico <part> <ep> - Watch a garupa PICO episode.\n${config.name} pico - Choose a part.\n${config.name} pull - Pull a card.\n${config.name} inventory - Show your inventory.\n${config.name} help - Show this help.`
    },
    'vi_VN': {
        "song.chooseBand": "Chọn một ban nhạc:\n{bands}",
        "song.chooseBand.invalid": "Lựa chọn không hợp lệ.",
        "song.chooseSong": "{msg}\n⇒ Reply số thứ tự bài hát.",
        "song.chooseSong.invalid": "Lựa chọn không hợp lệ.",
        "song.chooseSong.noAudioAvailable": "Không có sẵn audio.",
        "song.chooseAudioSource": "{msg}\n⇒ Reply với số nguồn audio để chơi.",
        "song.chooseAudioSource.invalid": "Lựa chọn không hợp lệ.",
        "song.search.noResult": "Không tìm thấy bài hát.",
        "pico.choosePart": "Chọn một phần:\n{parts}",
        "pico.choosePart.invalid": "Lựa chọn không hợp lệ.",
        "pico.chooseEpisode": "[ {part} ]\nTổng cộng: {total} eps\n⇒ Reply số tập bạn muốn xem.",
        "pico.chooseEpisode.invalid": "Lựa chọn không hợp lệ.",
        "pull.noData": "Dữ liệu của bạn chưa sẵn sàng...",
        "pull.notEnoughMoney": "Bạn cần {pullCost} XC để pull.",
        "pull.alreadyHave": "Bạn pull được thẻ bạn đã có, nhận lại {refund} XC.",
        "pull.cardType._0": "Bạn nhận được một thẻ {rarity} sao! (id: {id})",
        "pull.cardType._1": "Bạn nhận được một thẻ đặc biệt! (id: {id})",
        "pull.result": "\nTên: {name} ({attribute})\nKỹ năng: {skill_name}",
        "inventory.noData": "Dữ liệu của bạn chưa sẵn sàng...",
        "inventory.data": "=== ⌈ Bandori ⌋ ===\n • Tổng cộng: {_total}\n • Special: {_SPECIAL}\n • 4 sao: {_4STARS} ({_4STARS_AWAKENED} đã thức tỉnh)\n • 3 sao: {_3STARS} ({_3STARS_AWAKENED} đã thức tỉnh)\n • 2 sao: {_2STARS}",
        "any.error": "Đã xảy ra lỗi.",
        "downloading": "Đang tải xuống...",
        "help": `=== BANDORI HELP ===\n${config.name} song <tên bài hát> - Chơi một bài hát.\n${config.name} song - Chọn một bài hát.\n${config.name} pico <phần> <tập> - Xem một tập garupa PICO.\n${config.name} pico - Chọn một phần.\n${config.name} pull - Pull một thẻ.\n${config.name} inventory - Hiển thị kho của bạn.\n${config.name} help - Hiển thị trợ giúp này.`
    }
}

const playMusic = async (message, band, audioSource) => {
    const { title, url } = audioSource;
    const body = `${band}\n⌈ ${title.replace(/\n/g, '')} ⌋`;

    const songPath = join(global.cachePath, `${Date.now()}_${band}_${title.replace(/\n/g, "")}.ogg`);
    const aacPath = join(global.cachePath, `${Date.now()}_${band}_${title.replace(/\n/g, "")}.mp3`);
    try {
        await global.downloadFile(songPath, url);
        await new Promise((resolve, reject) => {
            fluent(songPath)
                .audioCodec('libmp3lame')
                .save(aacPath)
                .on('end', resolve)
                .on('error', reject);
        });
        global.deleteFile(songPath);
        return message.send({
            body,
            attachment: global.reader(aacPath)
        })
            .then(_ => global.deleteFile(aacPath))
            .catch(err => {
                global.deleteFile(aacPath);
                console.error(err);
            });
    } catch (error) {
        if (!global.isExists(songPath)) global.deleteFile(songPath);
        if (!global.isExists(aacPath)) global.deleteFile(aacPath);
        console.error(error);
        return message.reply(getLang('any.error'));
    }
}

const replyForAudioSources = async ({ message, getLang, eventData }) => {
    const { api } = global;
    const { chosenBand, song } = eventData;

    const chosenSource = parseInt(message.body);
    if (chosenSource < 1 || chosenSource > song.audioSources.length) return message.reply(getLang('song.chooseAudioSource.invalid'));

    api.unsendMessage(eventData.messageID);
    message.reply(getLang('downloading'));
    return playMusic(message, chosenBand, song.audioSources[chosenSource - 1]);
}

const replyForSongs = async ({ message, getLang, eventData }) => {
    const { api } = global;
    let { data, chosenBand, type } = eventData;

    const chosenSong = parseInt(message.body);
    let songs = [];

    for (const block of data) {
        songs = songs.concat(block.songs);
    }
    if (type == 'search') songs = [...data];
    if (chosenSong < 1 || chosenSong > songs.length) return message.reply(getLang('song.chooseSong.invalid'));
    if (type == 'search') chosenBand = songs[chosenSong - 1].band;

    api.unsendMessage(eventData.messageID);
    try {
        const { audioSources } = songs[chosenSong - 1];
        if (audioSources.length === 0) return message.reply(getLang('song.chooseSong.noAudioAvailable'));
        if (audioSources.length === 1) {
            message.reply(getLang('downloading'));
            return playMusic(message, chosenBand, audioSources[0]);
        }

        const msg = audioSources.map((source, i) => `${i + 1}. ${source.title.replace(/\n/g, "")}`).join('\n');
        return message.reply(getLang('song.chooseAudioSource', { msg }))
            .then(_ => _.addReplyEvent({ callback: replyForAudioSources, chosenBand, song: songs[chosenSong - 1] }))
            .catch(err => console.error(err));
    } catch (error) {
        console.error(error);
        message.send(getLang('any.error'));
    }
}

const replyForBands = async ({ message, getLang, eventData }) => {
    const band = parseInt(message.body);

    const chosenBand = Bands[band - 1];
    if (!chosenBand) return message.reply(getLang('song.chooseBand.invalid'));

    const data = global.bandori.data_audio[chosenBand];
    let i = 1, msg = `=== ${chosenBand} ===`;

    for (const block of data) {
        msg += `\n[ ${block.type} ]\n`;
        for (const song of block.songs) {
            msg += `${i++}. ${song.name}\n`;
        }
    }

    return message.reply(getLang('song.chooseSong', { msg }))
        .then(_ => _.addReplyEvent({ callback: replyForSongs, data, chosenBand }))
        .catch(err => console.error(err));
}

const playVideo = async (message, videoData, part) => {
    const { url, ep } = videoData;
    const video = ytdl(url, { quality: 18 });
    const savePath = join(global.cachePath, `${Date.now()}_${part}-${ep}.mp4`);
    const _writer = global.writer(savePath);

    video.pipe(_writer);
    video.on('end', () => {
        const stream = global.reader(savePath);
        message.send({
            body: `🎬 [ ${part} ] Episode ${ep}`,
            attachment: stream
        })
            .then(_ => global.deleteFile(savePath))
            .catch(e => {
                global.deleteFile(savePath);
                console.error(e);
            });
    });

    video.on('error', (error) => {
        if (global.isExists(savePath)) global.deleteFile(savePath);
        message.send(lang('any.error'));
        console.error(error);
    });

}

const replyForEps = async ({ message, getLang, eventData }) => {
    const { api } = global;
    const { chosenPart, data } = eventData;

    const chosenEp = parseInt(message.body);
    if (chosenEp < 1 || chosenEp > data.length) return message.reply(getLang('pico.chooseEpisode.invalid'));

    api.unsendMessage(eventData.messageID);
    message.reply(getLang('downloading'));
    return playVideo(message, data[chosenEp - 1], chosenPart);
}

const replyForPicoPart = async ({ message, getLang, eventData }) => {
    const part = parseInt(message.body);
    if (part < 1 || part > Picos.length) return message.reply(lang('pico.choosePart.invalid'));
    const chosenPart = Picos[part - 1];
    const partData = global.bandori.picos[chosenPart];

    message.reply(getLang('pico.chooseEpisode', { total: partData.length, part: chosenPart }))
        .then(_ => _.addReplyEvent({ callback: replyForEps, chosenPart, data: partData }))
        .catch(err => console.error(err));
}

const onCall = async ({ message, args, getLang, extra }) => {
    if (!global.bandori?.isReady) return;
    const { Users } = global.controllers;

    const query = args[0];
    const keyword = args.slice(1).join(' ');

    if (query == 'song' || query == 'songs') {
        if (!keyword) {
            const bands = Bands.map((band, i) => `${i + 1}. ${band}`).join('\n');
            return message.reply(getLang('song.chooseBand', { bands }))
                .then(_ => _.addReplyEvent({ callback: replyForBands }))
                .catch(err => console.error(err));
        } else {
            const storage = [], names = [];
            let chosenData = [];

            for (const band of Bands) {
                const data = global.bandori.data_audio[band];
                for (const block of data) {
                    for (const song of block.songs) {
                        storage.push({ band, ...song });
                        names.push(song.name);
                    }
                }
            }

            const firstStage = names.filter(name => name.toLowerCase().includes(keyword.toLowerCase()));
            if (firstStage.length > 0) {
                for (const name of firstStage) {
                    const index = names.indexOf(name);
                    if (index !== -1) chosenData.push(storage[index]);
                    if (chosenData.length >= 5) break;
                }
            }
            if (chosenData.length <= 2) {
                const results = stringSimilarity.findBestMatch(keyword, names);
                results.ratings.sort((a, b) => b.rating - a.rating);

                for (let i = 0; i < results.ratings.length; i++) {
                    const rating = results.ratings[i];
                    if (rating.rating == 0) break;

                    const index = storage.findIndex(song => song.name == rating.target && !chosenData.some(song => song.name == rating.target));
                    if (index !== -1) chosenData.push(storage[index]);
                    if (chosenData.length >= 5) break;
                }
            }

            if (chosenData.length === 0) return message.reply(getLang('song.search.noResult'));
            const msg = chosenData.map((result, i) => `${i + 1}. ${result.name}`).join('\n');
            return message.reply(getLang('song.chooseSong', { msg }))
                .then(_ => _.addReplyEvent({ callback: replyForSongs, data: chosenData, chosenBand: null, type: 'search' }))
                .catch(err => console.error(err));
        }
    } else if (query == 'pico') {
        const part = args[1]?.toLowerCase();
        const validPico = {
            "PICO": ["ss1", "1"],
            "PICO-OHMORI": ["ss2", "2", "ohmori"],
            "PICO-FEVER": ["ss3", "3", "fever"]
        }
        let chosenPart = null;
        for (const key in validPico) {
            if (validPico[key].includes(part)) chosenPart = key;
        }
        if (chosenPart === null || !part)
            return message.reply(getLang('pico.choosePart', { parts: Picos.map((p, i) => `${i + 1}. ${p}`).join("\n") }))
                .then(_ => _.addReplyEvent({ callback: replyForPicoPart }))
                .catch(err => console.error(err));

        const data = global.bandori.picos[chosenPart];
        const numberOfEps = data.length;

        const chosenEp = parseInt(args[2]);
        if (chosenEp && chosenEp > 0 && chosenEp <= numberOfEps) {
            message.reply(getLang('downloading'));
            return playVideo(message, data[chosenEp - 1], chosenPart);
        } else {
            return message.reply(getLang('pico.chooseEpisode', { total: numberOfEps, part: chosenPart }))
                .then(_ => _.addReplyEvent({ callback: replyForEps, data, chosenPart }))
                .catch(err => console.error(err));
        }
    } else if (query == 'pull') {
        const userData = await Users.getData(message.senderID);
        if (userData === null) return message.reply(getLang('pull.noData'));

        const bandori = userData.bandori || {};
        const money = userData.money || 0;
        const { pullRate, pullCost, refund } = extra;

        if (BigInt(money) < BigInt(pullCost)) return message.reply(getLang('pull.notEnoughMoney', { pullCost }));

        const { _SPECIAL: _SP, _4STARS: _4, _3STARS: _3, _2STARS: _2 } = pullRate;

        let storage = [];
        let _SPECIAL = global.bandori.cards.filter(card => global.bandori.special_cards.includes(card.id)),
            _4STARS = global.bandori.cards.filter(card => card.rarity == 4 && _SPECIAL.findIndex(c => c.id == card.id) == -1),
            _3STARS = global.bandori.cards.filter(card => card.rarity == 3),
            _2STARS = global.bandori.cards.filter(card => card.rarity == 2);

        let _SPSliceTo = _SPECIAL.length > _SP ? _SP : _SPECIAL.length,
            _4SliceTo = _4STARS.length > _4 ? _4 : _4STARS.length,
            _3SliceTo = _3STARS.length > _3 ? _3 : _3STARS.length,
            _2SliceTo = _2STARS.length > _2 ? _2 : _2STARS.length;

        _SPECIAL = global.shuffleArray(_SPECIAL).slice(0, _SPSliceTo);
        _4STARS = global.shuffleArray(_4STARS).slice(0, _4SliceTo);
        _3STARS = global.shuffleArray(_3STARS).slice(0, _3SliceTo);
        _2STARS = global.shuffleArray(_2STARS).slice(0, _2SliceTo);

        storage.push(..._SPECIAL, ..._4STARS, ..._3STARS, ..._2STARS);
        storage = global.shuffleArray(storage);

        const card = storage[Math.floor(Math.random() * storage.length)];
        const { name, skill_name, art, rarity, attribute, id } = card;

        const inventory = bandori.inventory || [];
        if (inventory.some(card => card.id == id)) {
            await Users.updateData(message.senderID, { money: String(BigInt(money) - BigInt(pullCost) + BigInt(refund)) });
            return message.reply(getLang('pull.alreadyHave', { refund }));
        }

        inventory.push({
            id,
            isAwakened: false
        });

        const stream = await global.getStream(encodeURI(art));
        const msg = {
            body: getLang(`${_SPECIAL.findIndex(c => c.id == id) !== -1 ? 'pull.cardType._1' : 'pull.cardType._0'}`, { rarity, id }) + getLang('pull.result', { name, skill_name, rarity, attribute }),
            attachment: stream
        }

        bandori.inventory = inventory;
        await Users.updateData(message.senderID, { bandori, money: String(BigInt(userData.money) - BigInt(pullCost)) });

        return message.reply(msg);
    } else if (query == 'inventory' || query == 'inv') {
        const userData = await Users.getData(message.senderID);
        if (userData === null) return message.reply(getLang('inventory.noData'));

        if (!userData.bandori) userData.bandori = { inventory: [] };
        if (!userData.bandori.inventory) userData.bandori.inventory = [];

        let storage = userData.bandori.inventory.map(e => {
            return {
                id: e.id,
                rarity: global.bandori.cards.find(card => card.id == e.id).rarity,
                isSpecial: global.bandori.special_cards.includes(e.id),
                isAwakened: e.isAwakened
            }
        });

        message.reply(getLang("inventory.data", {
            _total: storage.length,
            _SPECIAL: storage.filter(e => e.isSpecial).length,
            _4STARS: storage.filter(e => e.rarity == 4 && !e.isSpecial).length,
            _4STARS_AWAKENED: storage.filter(e => e.rarity == 4 && e.isAwakened).length,
            _3STARS: storage.filter(e => e.rarity == 3).length,
            _3STARS_AWAKENED: storage.filter(e => e.rarity == 3 && e.isAwakened).length,
            _2STARS: storage.filter(e => e.rarity == 2).length
        }));
    } else {
        return message.reply(getLang('help'));
    }
}

export default {
    config,
    langData,
    onLoad,
    onCall
}
