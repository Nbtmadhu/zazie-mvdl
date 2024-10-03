const { fetchJson } = require('../lib/functions');
const config = require('../config');
const { cmd } = require('../command');
const moment = require('moment');

// Fetch API URL
let baseUrl;
(async () => {
    try {
        let baseUrlGet = await fetchJson('https://raw.githubusercontent.com/prabathLK/PUBLIC-URL-HOST-DB/main/public/url.json');
        baseUrl = baseUrlGet.api;
    } catch (error) {
        console.error('Error fetching base URL:', error);
    }
})();

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function for downloading and sending media
async function downloadAndSendMedia(conn, mek, from, url, apiEndpoint, mediaType, pushname) {
    if (!url || !url.startsWith("https://")) {
        return conn.sendMessage(from, { text: "Please provide a valid URL." }, { quoted: mek });
    }

    const downloadingMsg = await conn.sendMessage(from, { text: "⏳ *Downloading...*" }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    try {
        const data = await fetchJson(`${baseUrl}/api/${apiEndpoint}?url=${encodeURIComponent(url)}`);

        const fileInfo = data.data.data || data.data;
        const captionHeader = `
${apiEndpoint.toUpperCase().replace('DL', ' DL')}

> *Requester*: ${pushname}
> *Bot*: Queen-Zazie-MD
> *File Name:* ${fileInfo.fileName || fileInfo.name || 'Not available'}
> *Size:* ${formatFileSize(fileInfo.fileSize || fileInfo.size || 0)}
> *Type:* ${fileInfo.mimeType || fileInfo.file_type || 'Not available'}

*We Will Send Your ${apiEndpoint.replace('dl', '').toUpperCase()} Content*
`.trim();

        if (mediaType === 'video') {
            const videoInfo = fileInfo;
            const caption = `${captionHeader}\n\n> Qᴜᴇᴇɴ-ᴢᴀᴢɪᴇ-ᴍᴅ`.trim();

            if (videoInfo.hd || videoInfo.HD) {
                await conn.sendMessage(from, { video: { url: videoInfo.hd || videoInfo.HD }, caption: `\n\n${caption}` }, { quoted: mek });
            }
            if (videoInfo.sd || videoInfo.SD) {
                await conn.sendMessage(from, { video: { url: videoInfo.sd || videoInfo.SD }, caption: `\n\n${caption}` }, { quoted: mek });
            }

            if (videoInfo.audio) {
                await conn.sendMessage(from, { 
                    audio: { url: videoInfo.audio }, 
                    mimetype: "audio/mpeg",
                    caption: `🎵 Audio extracted from ${apiEndpoint.replace('dl', '').toUpperCase()} video`
                }, { quoted: mek });
            }
        } else if (mediaType === 'document') {
            const caption = `${captionHeader}\n\n> Qᴜᴇᴇɴ-ᴢᴀᴢɪᴇ-ᴍᴅ`.trim();

            await conn.sendMessage(from, { 
                document: { url: fileInfo.download || fileInfo.link_1 }, 
                fileName: fileInfo.fileName || fileInfo.name, 
                mimetype: fileInfo.mimeType || fileInfo.file_type,
                caption: caption
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (error) {
        console.error(`Error in ${apiEndpoint}:`, error);
        await conn.sendMessage(from, { text: `❌ An error occurred: ${error.message}` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    } finally {
        await conn.sendMessage(from, { delete: downloadingMsg.key });
    }
}

// Google Drive Downloader
cmd({
    pattern: "gd",
    alias: ["googledrive"],
    desc: "Download Google Drive files",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, pushname }) => {
    await downloadAndSendMedia(conn, mek, from, q, 'gdrivedl', 'document', pushname);
});