# XAVIABOT DOCS (v2)
## UPDATED - 2023/11/14

### NEW XAVIABOT COMMANDS SNIPPET: [here](https://marketplace.visualstudio.com/items?itemName=XaviaTeam.xaviabot-snippets)

### INSTALLATION && REQUIREMENTS: [here](https://github.com/XaviaTeam/XaviaBot/blob/main/README.md)
<hr />

### CONTENTS:
- [TODO](#todo)
- [Built-in Functions](#built-in-functions)
- [Database](#database)
- [Commands](#command-plugin)

<hr />

### TODO
- [ ] Better documentations
- [ ] Better examples
- [ ] Dashboard
- [ ] SQL Support
- [ ] More economy features/command
- [ ] Code optimization
- [ ] More languages support

<hr />

### Built-in Functions:
+ request
+ GET
+ isExists
+ fileStats
+ mkdir
+ downloadFile
+ deleteFIle
+ reader
+ writer
+ sleep
+ loop
+ addCommas

And more...<br />
See [utils.js](https://github.com/XaviaTeam/XaviaBot/tree/main/core/var/utils.js) for more details.

<hr />

### Database

- Type: [JSON](https://www.json.org/json-en.html) - [MongoDB](https://www.mongodb.com/)
- Basic usages:<br />
```javascript
// plugin command example
async function onCall({ message }) {
    const { Users, Threads } = global.controllers;
    const userID = '100008907121641';
    const threadID = '2670470633061919';
    // code here
}
```
&nbsp;&nbsp;&nbsp;&nbsp;\+ **Users**
```javascript
// GET USER INFO
const userInfo = await Users.getInfo(userID);

// GET USER DATA
const userData = await Users.getData(userID);

// GET ARRAY OF USER DATA
const allUsers = await Users.getAll(); // get all
const allUsersWithIDs = await Users.getAll(["id1","id2","id3"]);

// All get methods return null or array of null if not found / unable to get data
```
```javascript
// GET USER NAME
const userInfo = await Users.getInfo(userID);
const userName = userInfo?.name; // name or undefined
```
```javascript
// UPDATE USER DATA
const userData = await Users.getData(userID);

userData.banned = !Boolean(userData.banned);

await Users.updateData(userID, { banned: userData.banned });
```
&nbsp;&nbsp;&nbsp;&nbsp;\+ **Threads**
```javascript
// GET THREAD INFO
const threadInfo = await Threads.getInfo(threadID);

// GET THREAD DATA
const threadData = await Threads.getData(threadID);

// GET MULTIPLE THREAD DATA
const allThreads = await Threads.getAll(); // get all
const allThreadsWithIDs = await Threads.getAll(["id1","id2","id3"]);

// All get methods return null or array of null if not found / unable to get data
```
```javascript
// GET THREAD NAME
const threadInfo = await Threads.getInfo(threadID);
const threadName = threadInfo?.name; // name or undefined
```
```javascript
// UPDATE THREAD DATA
const threadData = await Threads.getData(threadID);

threadData.banned = !Boolean(threadData.banned);

await Threads.updateData(threadID, { banned: threadData.banned });
```
<hr />

### Command Plugin

- Check example plugin: [example](https://github.com/XaviaTeam/XaviaBot/blob/main/plugins/commands/example)

```javascript
// plugin command example
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    // Do something
    message.send(getLang("message"));

    // args: Arguments, if /example 1 2 3, args = ["1", "2", "3"]
    // getLang: Get language from langData
    // extra: Extra property from config.plugins.json
    // data { user, thread }
    // userPermissions: User permissions (0: Member, 1: Admin, 2: Bot Admin)
    // prefix: Prefix used
}
```
- API docs: [here](https://github.com/XaviaTeam/fca-unofficial#documentation)

```javascript
// send message example
const { api } = global;
const { threadID, messageID, send, reply, react } = message;
const msg = 'Hello world!';

// to send
api.sendMessage(msg, threadID);
// or
send(msg);

//to reply
api.sendMessage(msg, threadID, messageID);
// or
reply(msg);

//to react
api.setMessageReaction('👍', messageID, null, true);
// or
react('👍');

// NOTE: only use send, reply or react function
// if you want to send/reply a message with
// the same threadID, messageID
```
```javascript
const { send } = message;
// add reply event
const msg = 'Reply me!';

function cb({ message, getLang, data, eventData }) {
    // Do something
    message.send(getLang("message.replied"));
    eventData.myData // myData from addReplyEvent
}

send(msg)
    .then(data => data.addReplyEvent({ callback: cb, myData: 'myData' }))
    .catch(err => console.error(err));

// add react event
const msg = 'React me!';

function cb({ message, getLang, data, eventData }) {
    // Do something
    message.send(getLang("message.reacted"));
    eventData.myData // myData from addReactEvent
}

send(msg)
    .then(data => data.addReactEvent({ callback: cb, myData: 'myData' }))
    .catch(err => console.error(err));
```
<hr />
Still Updating...
