const config = {
		name: "nabem",
		aliases: ["c2,nabem"],
		version: "1.1.0",
		description: "Chửi liên tục người được tag",
		usage: "[tag]",
		cooldown: 3,
		permissions: [2],
		credits: "vml"
}

if (!global.chuilientuc) {
		global.chuilientuc = new Map();
}

const DELAY_THREAD = 1000 * 60; // 1 phút chửi 1 lần/1 nhóm
const DELAY = 2000; // cứ mỗi 1 giây chửi 1 lần
const CAU_CHUI = [
"thằng bê đê bất lực vì mẹ nó bị đụ tung cái lồn:)))  {name}",
"con đĩ mẹ mày bất lực vì bị tao chửi mà chỉ biết câm lặng:)))  {name}",
"làm màu mà bị tao chửi rung cái con cặc:)))  {name}",
"Mẹ mày bị tao đụ lòi hột le:)))  {name}",
"thằng bê đê ảo cặc đòi cân và cái kết:)))  {name}",
"con đĩ mẹ của mày thèm cứt tao dữ lắm:)))  {name}",
"bị tao chửi sảng cặc đéo dám care:)))  {name}",
"mạnh lên sao yếu đuối v con:)))  {name}",
"mày run cặc chưa con:)))  {name}",
"chậm vậy sao cứu được con đĩ mẹ mày nhanh lên đi chứ:)))  {name}",
"chết cha nó sồn r  {name}",
"con đĩ mẹ mày gào thét đê?😛  {name}",
"mày gào lên con?😏  {name}",
"sao cay tao dọ?  {name}",
"mày sủa đi nè😛  {name}",
"sao mày xấu lồn gớm chó dị con?  {name}",
"sao cay tao hả😏?  {name}",
"sao mày giết mẹ vậy=)))  {name}",
"mày gào đi con=)))  {name}",
"nào ổn thì đú🤣👈  {name}",
"ê bê đê lên ăn hôi lẹ😘  {name}",
"mày đú rõ mò  {name}",
"sao mày ăn cứt tao😏  {name}",
"ai cho mày ăn cứt tao  {name}",
"sao mày óc cặc dữ con=)))  {name}",
"gặp tao đừng run nha?😂  {name}",
"con đĩ mẹ mày thèm cứt tao dữ lắm=)))  {name}",
"mày mồ côi mà đúng k🤣👈  {name}",
"ai cho mày sủa tao cho mày sủa chưa?  {name}",
"bị tao chọc cay hơn con chó luôn=)))  {name}",
"cố đi sắp win rồi nè😏  {name}",
"chừng nào mày mới làm lại tao dị?  {name}",
"mẹ mày sắp tắt thở kìa ê  {name}",
"đậu má mày gà mà sủa  {name}",
"sủa điên đi mà sủa hăng lên mới vui😘  {name}",
"mày mà ngưng một giây là con đĩ mẹ mày bả tắt đường thở á😏  {name}",
"ê chó ngu mày sợ tao hả😂  {name}",
"mày đú rõ mà sao mày đú dị?  {name}",
"mẹ mày chết chưa con=)))  {name}",
"ê bê đê sủa điên đi  {name}",
"sao mày sủa chậm dị?  {name}",
"nào làm lại tao nói đê?  {name}",
"bị tao chọc cay hơn con chó luôn😏  {name}",
"sủa đi rồi tao tha?  {name}",
"sủa điên lên cho mẹ?  {name}",
"mày ngưng là con đĩ mẹ mày chết?  {name}",
"cay tao lòi dái hả😏  {name}",
"não chó cay à?🤣  {name}",
"sao mày thảm dị=)))  {name}",
"mẹ mày bị tao địt rách màn trinh mà🤪  {name}",
"mẹ mày bị tao dã vào lồn=)))  {name}",
"địt mẹ mày sướng tê con cặc=)))  {name}",
"huhu nhìn mày như con cặc=)))  {name}",
"mày loạn luân bà già hả=)))  {name}",
"mẹ mày bị tao địt rên ư ử=)))  {name}",
"địt mẹ mày sảng khoái quá đi😛  {name}",
"tao địt mẹ mày nát lồn mà=)))  {name}",
"Ê bóng lồn  {name}",
"mẹ mày bị tao cưỡng hiếp=)))  {name}",
"mẹ mày đưa lồn chó liếm à🤣👈  {name}",
"mày óc cái lồn mà  {name}",
"năn nỉ đi tao tha😏  {name}",
"bú lồn tao đi🤪  {name}",
"mày ẳng gì dị?😏  {name}",
"nghe nói mày sợ tao?  {name}",
"vô danh cấm sủa?😏  {name}",
"gì mày thèm cứt tao hả=)))?  {name}",
"sao mày lề mề dị con  {name}",
"mày có tuổi hở?😏  {name}",
"tuổi lồn ăn tao á😏?  {name}",
"tao đụ má mày ná thở mà😛 {name}"
]; // các câu chửi, thêm {name} để thay thế bằng tên người bị chửi và đồng thời tag người đó

async function onCall({ message, args }) {
	const { mentions } = message;
	const mentionId = Object.keys(mentions)[0];
	const mentionName = mentions[mentionId];

	const isCallingStop = args[0]?.toLowerCase() === 'stop';

	if (!mentionId && !isCallingStop) return message.reply("Vui lòng tag người cần chửi");
	if (isCallingStop) {
		if (!global.chuilientuc.has(message.threadID)) return message.reply("Bot không đang chửi ai cả");
		global.chuilientuc.delete(message.threadID);
		return message.reply("vml tha cho mày đó akakak");
	}


	const _d = global.chuilientuc.get(message.threadID);

	if (_d) {
		const now = Date.now();
		const time = _d.time;
		const diff = now - time;

		if (diff < DELAY_THREAD) {
			const timeLeft = (DELAY_THREAD - diff) / 1000;
			return message.reply(`Vui lòng đợi ${Math.ceil(timeLeft)}s để tiếp tục chửi`);
		}
	}
	
	global.chuilientuc.set(message.threadID, {
		time: Date.now()
	});


	for (let i = 0; i < CAU_CHUI.length; i++) {
		if (!global.chuilientuc.has(message.threadID)) return;
		const cauChui = CAU_CHUI[i];
		
		if (cauChui.includes('{name}')) {
			const cauChuiFinal = cauChui.replace('{name}', mentionName);

			await message.send({
				body: cauChuiFinal,
				mentions: [{
					tag: mentionName,
					id: mentionId
				}]
			});
		} else {
			await message.send(cauChui);
		}

		await new Promise(resolve => setTimeout(resolve, DELAY));
	}
}


export default {
		config,
		onCall
}
