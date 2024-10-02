const config = require('../config')
const {cmd , commands} = require('../command')
const os = require("os")
const {runtime} = require('../lib/functions')
const pdfUrl = 'https://i.ibb.co/2PLgSdj/Picsart-24-09-16-17-49-35-655.jpg';

cmd({
    pattern: "menu",
    desc: "To get the menu.",
    react: "🎬",
    category: "main",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

let menumsg = `
👋 Hellow.! *${pushname}* ,

⦁ ɪ ᴀᴍ ᴀɴ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ꜱʏꜱᴛᴇᴍ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ᴛʜᴀᴛ ᴄᴀɴ ʜᴇʟᴘ ᴛᴏ ᴅᴏ ꜱᴏᴍᴇᴛʜɪɴɢ, ꜱᴇᴀʀᴄʜ ᴀɴᴅ ɢᴇᴛ ᴅᴀᴛᴀ / ɪɴꜰᴏʀᴍᴀᴛᴜᴏɴ ᴏɴʟʏ ᴛʜʀᴏᴜɢʜ *ᴡʜᴀᴛꜱᴀᴘᴘ.*

> *ᴠᴇʀsɪᴏɴ* : ${require("../package.json").version}
> *ʀᴜɴ ᴛɪᴍᴇ* : ${runtime(process.uptime())}

╭╼╼╼╼╼╼╼╼╼╼╼╼╼╼
*│🎬 SUBTITLE-DL-SITES 🎬*
│╼╼╼╼╼╼╼╼╼╼╼╼╼╼
│
│► cine _[ cinerulk ]_
│► baiscope _[ baiscopelk ]_
│► zoom _[ zoomlk ]_
│► pirate _[ piratelk ]_
│► subz _[ subz ]_
│
│╼╼╼╼╼╼╼╼╼╼╼╼╼╼
*│🎬 MV-DL-SITES 🎬*
│╼╼╼╼╼╼╼╼╼╼╼╼╼╼
│
│► cinez _[ cinesubz ]_
│► sinsub _[ sinhalasub ]_
│► mx _[ ytsmx ]_
│
│╼╼╼╼╼╼╼╼╼╼╼╼╼╼
*│🎬 CARTOON-DL-SITES 🎬*
│╼╼╼╼╼╼╼╼╼╼╼╼╼╼
│
│► ginisisila _[ ginisisilacartoon ]_
│
╰╼╼╼╼╼╼╼╼╼╼╼╼╼╼
`
// Send the initial message and store the message ID
const sentMsg = await conn.sendMessage(from, {
document: { url: pdfUrl }, // Path to your PDF file
    fileName: 'QUEEN-ZAZIE-MVDL', // Filename for the document
    mimetype: "application/xml",
    fileLength: 99999999999999,
    caption: menumsg,
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterName: '乡Qҽҽɳ-乙azie-MultiDevice࿐',
            newsletterJid: "120363331860205900@newsletter",
        },
        externalAdReply: {
            title: 'ＱＵＥＥＮ-ＺＡＺＩＥ ＭVDL-ｖ1',
            body: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ • ɴʙᴛᴍᴀᴅʜᴜꜱɪᴛʜ',
            thumbnailUrl: config.ALIVE_IMG, // Use the URL directly here
            sourceUrl: 'https://queen-zazie-md.vercel.app',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
});

} catch (e) {
console.log(e);
reply(`${e}`);
}
});
