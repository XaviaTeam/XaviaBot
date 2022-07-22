# XAVIABOT DOCS
## UPDATED - 2022/07/23

### INSTALLATION && REQUIREMENTS: [here](https://github.com/XaviaTeam/XaviaBot/blob/main/README.md)
<hr />

### Built-in Functions:
+ request
+ GET
+ isExists
+ downloadFile
+ deleteFIle
+ delay
+ loop

And more...<br />
See [common.js](https://github.com/XaviaTeam/XaviaBot/tree/main/app/src/modules/common.js) for more details.

<hr />

### Database

- Type: [JSON](https://www.json.org/json-en.html)
- Basic usages:<br />
```javascript
// plugin command example
async function onCall({ api, message, controllers }) {
    const { Users, Threads } = controllers;
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

// GET EVERY USER DATA
const allUsers = await Users.getAll();
```
```javascript
// GET USER NAME
const userInfo = await Users.getInfo(userID);
const userName = userInfo.name;
// or
const userName = await Users.getName(userID);
```
```javascript
// SET USER DATA
const userData = await Users.getData(userID);

userData.money += 100;

await Users.setData(userID, userData);
```
&nbsp;&nbsp;&nbsp;&nbsp;\+ **Threads**
```javascript
// GET THREAD INFO
const threadInfo = await Threads.getInfo(threadID);

// GET THREAD DATA
const threadData = await Threads.getData(threadID);

// GET EVERY THREAD DATA
const allThreads = await Threads.getAll();
```
```javascript
// GET THREAD NAME
const threadInfo = await Threads.getInfo(threadID);
const threadName = threadInfo.name;
// or
const threadName = await Threads.getName(threadID);
```
```javascript
// SET THREAD DATA
const threadData = await Threads.getData(threadID);

threadData.banned = true;

await Threads.setData(threadID, threadData);
```
<hr />

### Command Plugin

- Check example plugin: [example.js](https://github.com/XaviaTeam/XaviaBot/blob/main/app/plugins/commands/Example/example.js)

```javascript
// plugin command example
const onCall = async ({ api, message, args, getLang, db, controllers, userPermissions, prefix }) => {
    // api, read more bellow
    // message, contains all the info about the message with some extra functions
    // args, command arguments
    // getLang, get language function
    // db, don't touch it if you don't know what it is
    // controllers, as said above
    // userPermissions, an array of permisstion that executor has
    // prefix, bot or thread prefix
}
```
- API docs: [here](https://github.com/XaviaTeam/fbchat-js#documentation)

```javascript
// send message example
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

send(msg)
    .then(data => data.addReplyEvent({ myData: 'myData' }))
    .catch(err => console.error(err));

// add react event
const msg = 'React me!';

send(msg)
    .then(data => data.addReactEvent())
    .catch(err => console.error(err));
```
```javascript
function onReply({ message, eventData }) {
    const { send, senderID, body } = message;
    const { author, messageID, threadID, name, myData } = eventData;
    // eventData contains:
    // myData: 'myData' as passed in addReplyEvent
    // author, the ID of the one who executed the command
    // messageID, the ID of the message added reply event to
    // threadID, the ID of the thread that added reply event to
    // name, the name of the plugin of the command that was executed

    if (author === senderID) {
        send(`You replied: ${body}\nYour Data: ${myData}`);
    }
}
// same goes for react event
```
<hr />
Still Updating...
