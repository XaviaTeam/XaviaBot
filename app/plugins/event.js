import { } from 'dotenv/config';
import imgbbUploader from "imgbb-uploader";
import { writeFileSync, createReadStream, unlinkSync } from 'fs';

const imgbb_key = process.env.IMGBB_KEY;

export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};
    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;
    switch (event.type) {
        case "event": {
            switch (event.logMessageType) {
                case "log:subscribe":
                    {
                        if (Object.keys(getThreadInfo).length > 0) {
                            for (const user of logMessageData.addedParticipants) {
                                if (!getThreadInfo.participantIDs.some(uid => uid == user.userFbId)) {
                                    getThreadInfo.participantIDs.push(user.userFbId);
                                }
                            };
                        }
                        const authorName = await Users.getName(author);
                        if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
                            if (getThreadInfo.isSubscribed == false) getThreadInfo.isSubscribed = true;
                            for (const server of client.data.monitorServers) {
                                api.sendMessage(`Bot has been added to ${getThreadInfo.name || threadID} (${threadID}) by ${authorName} (${author})`, server);
                            }
                            const Prefix = getThreadData.prefix ? getThreadData.prefix : client.config.PREFIX;
                            api.changeNickname(`[ ${Prefix} ] ${(!client.config.BOTNAME) ? "Xavia" : client.config.BOTNAME}`, threadID, botID);
                            api.sendMessage(`Connected successfully!\nUse ${Prefix}help to list all commands.`, threadID, () => {
                                if (!getMonitorServerPerThread[threadID]) {
                                    const newMonitorName = `${threadID} - Monitor`;
                                    api.createNewGroup([botID, author], newMonitorName, async (err, info) => {
                                        if (err) api.sendMessage(`Couldn't create new monitor for this group.`, threadID, () => console.log(err));
                                        else {
                                            console.log("k loi?");
                                            const getAdminData = db.get('admin');
                                            getAdminData.monitorServerPerThread[threadID] = info;
                                            await db.set('admin', getAdminData);
                                            
                                            client.data.monitorServerPerThread[threadID] = info;
                                            api.sendMessage(`Group ${threadID} will be monitored here.`, info);
                                        };
                                    });
                                }
                            });
                        } else if (getMonitorServerPerThread[threadID]) {
                            const joinNameArray = [];
                            for (const id in logMessageData.addedParticipants) {
                                const joinName = logMessageData.addedParticipants[id].fullName;
                                joinNameArray.push(joinName);
                            }
                            let getMsg = `${authorName} added to group ${joinNameArray.length} member(s):\n${joinNameArray.join(', ')}`;
                            api.sendMessage(getMsg, getMonitorServerPerThread[threadID], (err) => {
                                if (err) console.log(err);
                            });
                        }
                        const allThreads = await Threads.getAll();
                        const threadIndex = allThreads.findIndex(e => e.id == threadID);
                        getThread.info = getThreadInfo;
                        allThreads[threadIndex] = getThread;
                        await db.set('threads', allThreads);
                    }
                    break;
                case "log:unsubscribe":
                    {
                        if (Object.keys(getThreadInfo).length === 0) return;
                        getThreadInfo.participantIDs.splice(getThreadInfo.participantIDs.indexOf(String(logMessageData.leftParticipantFbId)), 1);
                        const type = (author == logMessageData.leftParticipantFbId) ? "has left" : "has been kicked out from";
                        const authorName = await Users.getName(author);

                        if (logMessageData.leftParticipantFbId == botID) {
                            getThreadInfo.isSubscribed = false;

                            for (const server of client.data.monitorServers) {
                                if (server != threadID) {
                                    api.sendMessage(`Bot ${type} ${getThreadInfo.name} (${threadID}) ${type == "has been kicked out from" ? ` by ${authorName} (${author})` : ''}`, server);
                                } else {
                                    client.data.monitorServers.splice(client.data.monitorServers.indexOf(server), 1);
                                    const getSettings = db.get('Admin');
                                    let monitorServers = getSettings.monitorServers || [];
                                    if (monitorServers.includes(server)) {
                                        monitorServers.splice(monitorServers.indexOf(server), 1);
                                    }
                                    getSettings.monitorServers = monitorServers;
                                    await db.set('Admin', getSettings);
                                }
                            }
                        } else if (getMonitorServerPerThread[threadID]) {
                            const leftName = await Users.getName(logMessageData.leftParticipantFbId);
                            const getMsg = `${leftName} ${type} ${getThreadInfo.name}${type == "has been kicked out from" ? ` by ${authorName}` : ''}`;
                            api.sendMessage(getMsg, getMonitorServerPerThread[threadID], (err) => {
                                if (err) console.log(err);
                            });
                        };

                        const allThreads = await Threads.getAll();
                        const threadIndex = allThreads.findIndex(e => e.id == threadID);
                        getThread.info = getThreadInfo;
                        allThreads[threadIndex] = getThread;
                        await db.set('threads', allThreads);
                    }
                    break;
                case "log:user-nickname":
                    {
                        if (Object.keys(getThreadInfo).length === 0) return;
                        const oldNickname = getThreadInfo.nicknames[logMessageData.participant_id] || null;
                        const newNickname = logMessageData.nickname;
                        let atlertMsg = '"_author_" has changed "_target_" nickname to "_new_"',
                            smallCheck = false;
                        if (getThreadData.noChangeNickname == true) {
                            const isBot = author == botID;
                            const isReversing = client.data.temps.some(i => i.type == 'noChangeNickname' && i.threadID == threadID);
                            if (!(isBot && isReversing)) {
                                client.data.temps.push({ type: 'noChangeNickname', threadID: threadID });
                                atlertMsg += '\nGroup does not allow nickname change so it has been ignored.';
                                api.changeNickname(oldNickname, threadID, logMessageData.participant_id, async () => {
                                    await new Promise(resolve => setTimeout(resolve, 300));
                                    client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeNickname', threadID: threadID }), 1);
                                });
                            } else if (isBot) {
                                smallCheck = true;
                            }
                        } else {
                            getThreadInfo.nicknames[logMessageData.participant_id] = newNickname;
                            const allThreads = await Threads.getAll();
                            const threadIndex = allThreads.findIndex(e => e.id == threadID);
                            allThreads[threadIndex].info = getThreadInfo;
                            await db.set('threads', allThreads);
                        }

                        if (!smallCheck && getMonitorServerPerThread[threadID]) {
                            const authorName = await Users.getName(author);
                            const targetName = await Users.getName(logMessageData.participant_id);
                            atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_target_', targetName).replace('_new_', newNickname);
                            api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
                        }
                    }
                    break;
                case "log:thread-name":
                    {
                        if (Object.keys(getThreadInfo).length === 0) return;
                        const oldName = getThreadInfo.name;
                        const newName = logMessageData.name;
                        let atlertMsg = '"_author_" has changed group name to "_new_"',
                            smallCheck = false;
                        if (getThreadData.noChangeBoxName == true) {
                            const isBot = author == botID;
                            const isReversing = client.data.temps.some(i => i.type == 'noChangeBoxName' && i.threadID == threadID);
                            if (!(isBot && isReversing)) {
                                client.data.temps.push({ type: 'noChangeBoxName', threadID: threadID });
                                atlertMsg += '\nGroup does not allow name change so it has been ignored.';
                                api.setTitle(oldName, threadID, () => {
                                    client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxName', threadID: threadID }), 1);
                                });
                            } else if (isBot) {
                                smallCheck = true;
                            }
                        } else {
                            getThreadInfo.name = newName;
                            const allThreads = await Threads.getAll();
                            const threadIndex = allThreads.findIndex(e => e.id == threadID);
                            allThreads[threadIndex].info = getThreadInfo;
                            await db.set('threads', allThreads);
                        }
                        if (!smallCheck && getMonitorServerPerThread[threadID]) {
                            const authorName = await Users.getName(author);
                            atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_new_', newName);
                            api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
                        }
                    }
                    break;
                case "log:thread-color":
                case "log:thread-icon":
                    {
                        if (Object.keys(getThreadInfo).length === 0) return;
                        const oldColor = getThreadInfo.color;
                        if (logMessageData.hasOwnProperty('thread_color') || logMessageData.hasOwnProperty('theme_color')) {
                            const newColor = (logMessageData.thread_color || logMessageData.theme_color).slice(2);
                            const allThreads = await Threads.getAll();
                            const threadIndex = allThreads.findIndex(e => e.id == threadID);
                            allThreads[threadIndex].info.color = newColor;
                            await db.set('threads', allThreads);
                            if (getMonitorServerPerThread[threadID]) {
                                const authorName = await Users.getName(author);
                                let atlertMsg = '"_author_" has changed group color from "_old_" to "_new_"';
                                atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_old_', oldColor).replace('_new_', newColor);
                                if (logMessageData.hasOwnProperty('theme_name_with_subtitle')) {
                                    atlertMsg += `\n • Theme: ${logMessageData.theme_name_with_subtitle}`;
                                }
                                api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
                            }
                        }
                        const oldEmoji = getThreadInfo.emoji;
                        if (logMessageData.hasOwnProperty('thread_icon') || logMessageData.hasOwnProperty('theme_emoji')) {
                            const newEmoji = logMessageData.thread_icon || logMessageData.theme_emoji;
                            let atlertMsg = '"_author_" has changed group emoji from "_old_" to "_new_"';
                            const allThreads = await Threads.getAll();
                            const threadIndex = allThreads.findIndex(e => e.id == threadID);
                            allThreads[threadIndex].info.emoji = newEmoji;
                            await db.set('threads', allThreads);
                            if (getMonitorServerPerThread[threadID]) {
                                const authorName = await Users.getName(author);
                                atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_old_', oldEmoji).replace('_new_', newEmoji);
                                api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
                            }
                        }
                    }
                    break;
                case "log:thread-approval-mode":
                    {
                        getThreadInfo.approvalMode = logMessageData.APPROVAL_MODE == 0 ? false : true;
                        const allThreads = await Threads.getAll();
                        const threadIndex = allThreads.findIndex(e => e.id == threadID);
                        allThreads[threadIndex].info = getThreadInfo;
                        await db.set('threads', allThreads);
                        if (getMonitorServerPerThread[threadID]) {
                            const authorName = await Users.getName(author);
                            const atlertMsg = `"_author_" has changed approval mode to "_new_"`;
                            atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_new_', getThreadInfo.approvalMode);
                        }
                    }
                default:
                    break;
            }
            break;
        }
        case "change_thread_image":
            {
                if (Object.keys(getThreadInfo).length === 0) return;
                const oldImage = getThreadInfo.imageSrc || null;
                let atlertMsg = '"_replaceme_" has changed the group image.',
                    smallCheck = false;
                if (getThreadData.noChangeBoxImage == true && oldImage) {
                    const isBot = author == botID;
                    const isReversing = client.data.temps.some(i => i.type == 'noChangeBoxImage' && i.threadID == threadID);
                    if (!(isBot && isReversing)) {
                        let thing_to_push = { type: 'noChangeBoxImage', threadID };
                        client.data.temps.push(thing_to_push);
                        atlertMsg += '\nBecause noChangeBoxImage is enabled, the group image has been changed back.';
                        try {
                            const imgBuffer = (await get(oldImage, {
                                responseType: 'arraybuffer'
                            })).data;
                            const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
                            writeFileSync(imagePath, Buffer.from(imgBuffer, 'utf-8'));
                            api.changeGroupImage(createReadStream(imagePath), threadID, async () => {
                                unlinkSync(imagePath);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxImage', threadID: threadID }), 1);
                            });
                        } catch (err) {
                            console.log(err);
                        }
                    } else if (isBot) {
                        smallCheck = true;
                    }
                } else {
                    let newImageURL = event.image.url;
                    try {
                        const imgBuffer = (await get(newImageURL, {
                            responseType: 'arraybuffer'
                        })).data;
                        const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
                        writeFileSync(imagePath, Buffer.from(imgBuffer, 'utf-8'));
                        const imgbb_res = await imgbbUploader(imgbb_key, imagePath);
                        newImageURL = imgbb_res.url;
                        unlinkSync(imagePath);
                    } catch (err) {
                        console.log(err);
                    }
                    if (!oldImage)
                        atlertMsg += '\nBecause noChangeBoxImage is enabled but the group image is not set, so it will be set to the newly added group image.';
                    getThreadInfo.imageSrc = newImageURL;
                    const allThreads = await Threads.getAll();
                    const threadIndex = allThreads.findIndex(e => e.id == threadID);
                    getThread.info = getThreadInfo;
                    allThreads[threadIndex] = getThread;
                    await db.set('threads', allThreads);
                }
                if (!smallCheck && getMonitorServerPerThread[threadID]) {
                    const authorName = await Users.getName(author);
                    atlertMsg = atlertMsg.replace('_replaceme_', `${authorName}`);
                    api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
                }
            }
            break;
        default:
            break;
    }
}
