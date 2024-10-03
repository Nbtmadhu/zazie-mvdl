const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

// Command handler for searching cartoons
cmd({
    pattern: "ginisisila",
    react: '📑',
    category: "download",
    desc: "Scrape cartoon episodes",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply('*Please provide a search query! (e.g., Garfield)*');

        // Construct the search URL
        const searchUrl = `https://ginisisilacartoon.net/search.php?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);

        let episodes = [];

        // Scrape episode details
        $("div.inner-video-cell").each((index, element) => {
            const title = $(element).find("div.video-title > a").attr("title");
            const postedTime = $(element).find("div.posted-time").text().trim();
            const episodeLink = $(element).find("div.video-title > a").attr("href");
            const imageUrl = $(element).find("div.inner-video-thumb-wrapper img").attr("src");

            if (title && episodeLink) {
                episodes.push({
                    title,
                    postedTime,
                    episodeLink: `https://ginisisilacartoon.net/${episodeLink}`,
                    imageUrl: imageUrl
                });
            }
        });

        if (episodes.length === 0) {
            return await reply(`No results found for: ${q}`);
        }

        // Prepare the list of episodes
        let info = `📺 Search Results for *${q}:*\n\n`;
        episodes.forEach((ep, index) => {
            info += `*${index + 1}.* ${ep.title}\n🗓️ Posted: ${ep.postedTime}\n🔗 Link: ${ep.episodeLink}\n\n`;
        });

        // Send the episode list message
        const sentMsg = await conn.sendMessage(from, { text: info }, { quoted: mek });
        const messageID = sentMsg.key.id;

        // Listen for user's selection
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const from = mek.key.remoteJid;

            // Check if the message is a reply to the list of episodes
            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;
            if (isReplyToSentMsg) {
                let [selectedNumber, jid] = messageType.split(/\s*\|\s*/);

                selectedNumber = parseInt(selectedNumber.trim());
                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= episodes.length) {
                    const selectedEpisode = episodes[selectedNumber - 1];

                    // Validate JID, if provided
                    if (!jid || (!jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us'))) {
                        jid = from;  // Default to the current chat if no valid JID is provided
                    }

                    // Send options to the user (image, details, or document)
                    let optionsMessage = `*You selected: ${selectedEpisode.title}*\n\nChoose an option:\n\n1️⃣ Information (Details & Image)\n2️⃣ Episode (Document)`;
                    const imageMessage = {
                        image: { url: selectedEpisode.imageUrl },
                        caption: optionsMessage
                    };
                    const optionsMsg = await conn.sendMessage(from, imageMessage, { quoted: mek });

                    const optionsMessageID = optionsMsg.key.id;

                    // Listen for the user's choice (1 or 2)
                    conn.ev.on('messages.upsert', async (optionUpdate) => {
                        const mekOption = optionUpdate.messages[0];
                        if (!mekOption.message) return;
                        const messageTypeOption = mekOption.message.conversation || mekOption.message.extendedTextMessage?.text;

                        // Check if the message is a reply to the options message
                        const isReplyToOptionsMsg = mekOption.message.extendedTextMessage && mekOption.message.extendedTextMessage.contextInfo.stanzaId === optionsMessageID;
                        if (isReplyToOptionsMsg) {
                            if (messageTypeOption === '1') {
                                // Send the episode details and image to the specified JID
                                const episodeInfo = `*🪄 Name:* ${selectedEpisode.title}\n⏳ *Date:* ${selectedEpisode.postedTime}\n📎 *Episode Link:* ${selectedEpisode.episodeLink}`;
                                const detailsImageMessage = {
                                    image: { url: selectedEpisode.imageUrl },
                                    caption: episodeInfo
                                };
                                await conn.sendMessage(jid, detailsImageMessage, { quoted: mekOption });

                            } else if (messageTypeOption === '2') {
                                // Send the episode document to the specified JID
                                const episodePageResponse = await axios.get(selectedEpisode.episodeLink);
                                const $ = cheerio.load(episodePageResponse.data);
                                const iframeSrc = $('div#player-holder iframe').attr('src');

                                if (iframeSrc) {
                                    const apiUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${iframeSrc}&apikey=mnp3grlZ`;
                                    try {
                                        const downloadResponse = await axios.get(apiUrl);
                                        const downloadUrl = downloadResponse.data.result.downloadUrl;

                                        if (downloadUrl) {
                                            await conn.sendMessage(jid, {
                                                document: { url: downloadUrl },
                                                mimetype: "video/mp4",
                                                fileName: `${selectedEpisode.title}.mp4`,
                                                caption: `${selectedEpisode.title}.mp4 | Powered by NBTxMADHUSITH`
                                            }, { quoted: mekOption });
                                        } else {
                                            await reply('Failed to retrieve the download link for this episode.');
                                        }
                                    } catch (error) {
                                        console.error('Error fetching the download link:', error);
                                        await reply('An error occurred while trying to fetch the download link.');
                                    }
                                } else {
                                    await reply('No downloadable link found for this episode.');
                                }
                            } else {
                                await reply('Please choose a valid option (1 or 2).');
                            }
                        }
                    });
                } else {
                    await reply('Please reply with a valid number from the list.');
                }
            }
        });
    } catch (e) {
        reply('*Error occurred while scraping!*');
        console.error(e);
    }
});