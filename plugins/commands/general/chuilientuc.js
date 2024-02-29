const config = {
		name: "chuilientuc",
		aliases: ["c"],
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
const DELAY = 1200; // cứ mỗi 1 giây chửi 1 lần
const CAU_CHUI = [
	"chó ăn cứt cay 🤣🤣 {name}",
"sủa đê 🤣🤣 {name}",
"chó bú cứt🤣🤣👌{name}",
"hăng hái đê :)) {name}",
"chậm dọ 🤣🤣 {name}",
"óc dái cay r🤣🤣 {name}",
"ăn hại phát biểu lẹ đê 🤣🤣 {name}",
"óc dái :))) {name}",
"ổn phải k? {name}",
"ngu ớn 🤣🤣👌 {name}",
"chó ăn cứt 🐶 {name}",
"dái đú :)))) {name}",
"yếu dữ ta😏😏 {name}",
"con chó đần👉🤣 {name}",
"ổn dữ chưa =))) {name}",
"run ớn dạ :))) {name}",
"óc đú 🤣🤣 {name}",
"rồi xong 🤢🤢 {name}",
"có thể hăng ko á  {name}",
"ẻm cay doài =))) {name}",
"cay tuột buồi 👉🤣{name}",
"ei ei =)) {name}",
"em ei :3 {name}",
"chạy à {name}",
"mày sợ hả 🤢🤢 {name}",
"coi ẻm sồn kìa🤣🤣 👌{name}",
"lại bá à :))) {name}",
"sao chậm dữ {name}",
"eo oyyy:3 {name}",
"hú hú🤨 {name}",
"sao ức chế dạ 😏😏 {name}",
"con não cún bị chửi kìa 🤣🤣🐶 {name}",
"mau đê :)) {name}",
"hăng đê :))) {name}",
"sủa mau đê =)) {name}",
"cần cứu ko :)) {name}",
"cố đi :3 {name}",
"gáng lên đê :))) {name}",
"sủa to lên🤣🤣 {name}",
"phò nông thôn 🤢🤢 {name}",
"óc cặc tỉnh lẽ =)))) {name}",
"khoẻ ko 🤣🤣 {name}",
"kkk {name}",
"đói à🤣🐶👌 {name}",
"ăn chưa à 🤣🤣 {name}",
"chưa đk :))) {name}",
"thấy kém cõi :)) {name}",
"đú cứt kìa :))) {name}",
"eo oyyy:3 {name}",
"cố đê 🤣🤣 {name}",
"thấy mày đơ đơ :))) {name}",
"con cave 🤣🤣 {name}",
"mạnh lên:))) {name}",
"gõ mạnh lên đê:)) {name}",
"thấy ngại ngùng z🤣🤘 {name}",
"tự nhiên đê {name}",
"mệt đk {name}",
"cấm m ngưng {name}",
"đĩ đầu đinh :))) {name}",
"lẹ đê:)) {name}",
"mày lag à :)) {name}",
"m trầm cảm à :))) {name}",
"tâm lí ko vững à :)) {name}",
"cần thuốc à :)) {name}",
"hấp hối hả🤣🤣 {name}",
"khó thở dk :)) {name}",
"cần oxi ko :))) {name}",
"mày bệnh nặng lắm à :))) {name}",
"tuột hứng cha :))) {name}",
"tnh gà :))) {name}",
"sao chậm chạp v :)) {name}",
"óc dái 🤣🤣 {name}",
"lồn cụ con đĩ đớ🤣🤣 {name}",
"lưu loát lên đê 🤣🤣 {name}",
"khựng dạ :))) {name}",
"t mạnh lắm phải ko à :))) {name}",
":))) nhỏ mếu à ae {name}",
"m nghèo mà {name}",
"sợ t lắm à:3 {name}",
"hả cu =))) {name}",
"thấy tội quá:)) {name}",
"thương ẻm cố gắng🤢🤘 {name}",
"mà ngu🤣🤣 {name}",
":)) 🤣🤣 {name}",
"cay lắm à :)) {name}",
"nhạt nhoè v à {name}",
"ko cảm hứng để hăng à :))) {name}",
"xạo lồn à :))) {name}",
"khóc đk :))) {name}",
"cave tỉnh lẽ phát biểu:)) {name}",
"ra tín hiệu đê :))) {name}",
"SOS con dái đú 🤣🤣🤢 {name}",
"ớ ớ ớ :))) {name}",
"chó ăn cứt :))) {name}",
"chó đú sàn 👌🐶 {name}",
"ỉa ra máu r à :))) {name}",
"nghèo k có nghi lực à:)) {name}",
"phản kháng đê :))) t win à {name}",
"kkk {name}",
"m chết r à :))) {name}",
"m nghèo mà em 😏🤣 {name}",
"m thèm cứt t mà:)) {name}",
"đĩ mẹ m ngu mà👉🤣 {name}",
"m cay tao mà :)) {name}",
"con óc cứt thối🤢🤢 {name}",
"con đĩ mặt chim🤪🤪 {name}",
"ôm hận à 🤨 {name}",
"con đĩ nhà núi :))) {name}",
"bede bóng lộ =)) {name}",
"cn đĩ mẹ mày {name}",
"tao từ hình mẹ m mà :)) {name}",
"tk phế vật ăn hại😏🤘 {name}",
"đú đởn hả con :)) {name}",
"m sao dọ {name}",
"sủa nè  {name}",
"123 sủa😏 {name}",
"lẹ nè  {name}",
"alo alo hú hú  {name}",
"th cầm thú {name}",
"m s dạ  {name}",
"m sợ mẹ hả  {name}",
"lên đi mẹ ko giết cha má m đâu mà 😏 {name}",
"hù :)) {name}",
"bất ổn hở {name}",
"s đó  {name}",
"m rớt kìa th gà🤪 {name}",
"t cấm m chối nhen {name}",
"chối t giết cha má m nè:))) {name}",
"hăng xíu lẹ kaka🤢 {name}",
"th đần  {name}",
"lên mẹ biểu {name}",
"k lên t tuyệt chủng m nhen cn thú {name}",
"m thích đú ko dạ🤨 {name}",
"ko rep = t win nhen  {name}",
"cấm chạy nhen {name}",
"m mau  {name}",
"lên đây ơ ơ  {name}",
"th ngu ê {name}",
"s á lên đây mẹ sút m chết {name}",
"m khóc à 👉🤣 {name}",
"sủa liên tục ơ🤣🤣 {name}",
"cầu cứu lũ đú à  {name}",
"sục dái nó xem à {name}",
"dái thâm v? {name}",
"chậm v cn culi🤣🤣👌 {name}",
"hoảng loạn à {name}",
"bất ổn à 🤮🤮 {name}",
"run à {name}",
"chạy à  {name}",
"đuối à  {name}",
"bại chưa 👉😏 {name}",
"sủa mau🙄🙄👈 {name}",
"mạnh dạn lên  {name}",
"nhanh t cho cơ hội cứu má m nè {name}",
"cấm mách mẹ {name}",
"ảo war hở :)) {name}",
"dồn ko  {name}",
"đua nè lên sàn t chấp😏👌 {name}",
"th chợ búa m sao v {name}",
"th đầu buồi mặt chó😢🫵🏻👈🏻 {name}",
"cấm hoảng loạn {name}",
"lại phải win nữa à🙄🙄 {name}",
"kkk {name}"
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
