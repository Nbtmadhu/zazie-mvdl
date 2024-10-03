const axios = require('axios');
const cheerio = require('cheerio');
const { cmd, commands } = require('../command');

// Command handler for searching cartoons
cmd({
    pattern: "cartoon",
    react: '📑',
    category: "download",
    desc: "Scrape cartoon episodes",
    filename: __filename
}, async (conn, m, mek, { from, q, isDev, reply }) => {
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
            const imageUrl = $(element).find("div.inner-video-thumb-wrapper img").attr("src"); // Get episode image URL

            if (title && episodeLink) {
                episodes.push({
                    title,
                    postedTime,
                    episodeLink: `https://ginisisilacartoon.net/${episodeLink}`,
                    imageUrl: imageUrl
                });
            }
        });

        // If no episodes found
        if (episodes.length === 0) {
            return await reply(`No results found for: ${q}`);
        }

        // Prepare message info
        let info = `📺 Search Results for *${q}:*\n\n`;
        episodes.forEach((ep, index) => {
            info += `*${index + 1}.* ${ep.title}\n🗓️ Posted: ${ep.postedTime}\n🔗 Link: ${ep.episodeLink}\n\n`;
        });

        // Send the compiled information
        const sentMsg = await conn.sendMessage(from, { text: info }, { quoted: mek });
        const messageID = sentMsg.key.id; // Save the message ID for later reference

        // Listen for the user's response
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const from = mek.key.remoteJid;

            // Check if the message is a reply to the previously sent message
            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;
            if (isReplyToSentMsg) {
                const selectedNumber = parseInt(messageType.trim());
                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= episodes.length) {
                    const selectedEpisode = episodes[selectedNumber - 1];

                    // Send options: Information or Document
                    let optionsMessage = `*You selected: ${selectedEpisode.title}*\n\nChoose an option:\n\n1️⃣ Information (Details & Image)\n2️⃣ Episode (Document)`;
                    const optionsMsg = await conn.sendMessage(from,{image:{url: selectedEpisode.imageUrl},caption: optionMessage},{quoted:mek});
                    const optionsMessageID = optionsMsg.key.id; // Save the ID for future reference

                    // Listen for the user's choice (1 or 2)
                    conn.ev.on('messages.upsert', async (optionUpdate) => {
                        const mekOption = optionUpdate.messages[0];
                        if (!mekOption.message) return;
                        const messageTypeOption = mekOption.message.conversation || mekOption.message.extendedTextMessage?.text;

                        // Check if the message is a reply to the options message
                        const isReplyToOptionsMsg = mekOption.message.extendedTextMessage && mekOption.message.extendedTextMessage.contextInfo.stanzaId === optionsMessageID;
                        if (isReplyToOptionsMsg) {
                            if (messageTypeOption === '1') {
                                // React to the user's choice (⬇️ indicates details are being sent)
                                await conn.sendMessage(from, { react: { text: '🪄', key: mekOption.key } });

                                // Send episode details with image
                                const episodeInfo = `*🪄 ɴᴀᴍᴇ:-* ${selectedEpisode.title}\n⏳ *ᴅᴀᴛᴇ:-* ${selectedEpisode.postedTime}\n📎 *ᴇᴘɪꜱᴏᴅᴇ ʟɪɴᴋ*:- ${selectedEpisode.episodeLink}`;
                                const imageMessage = {
                                    image: { url: selectedEpisode.imageUrl },
                                    caption: episodeInfo
                                };
                                await conn.sendMessage(from, imageMessage, { quoted: mekOption });

                                // React to successful completion
                                await conn.sendMessage(from, { react: { text: '☘', key: mekOption.key } });

                            } else if (messageTypeOption === '2') {
                                // React to the user's choice (⬇️ indicates episode is being downloaded)
                                await conn.sendMessage(from, { react: { text: '⬇️', key: mekOption.key } });

                                // Fetch the episode page to extract the video link (iframe src)
                                const episodePageResponse = await axios.get(selectedEpisode.episodeLink);
                                const $ = cheerio.load(episodePageResponse.data);

                                // Extract the IFRAME src link
                                const iframeSrc = $('div#player-holder iframe').attr('src');

                                if (iframeSrc) {
                                    // Call the external API to get the download link using the iframe link
                                    const apiUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${iframeSrc}&apikey=mnp3grlZ`;

                                    try {
                                        const downloadResponse = await axios.get(apiUrl);
                                        const downloadUrl = downloadResponse.data.result.downloadUrl;

                                        if (downloadUrl) {
                                            // React to the upload (⬆️ indicates upload in progress)
                                            await conn.sendMessage(from, { react: { text: '⬆️', key: mekOption.key } });

                                            // Send the episode as a document (.mp4)
                                            await conn.sendMessage(from, {
                                                document: { url: downloadUrl },
                                                mimetype: "video/mp4",
                                                fileName: `NBTxMADHUSITH | ${selectedEpisode.title}.mp4`,
                                                caption: `${selectedEpisode.title} | Powered By NBTxMADHUSITH\n\n> ＱＵＥＥＮ-ＺＡＺＩＥ ＭＤ-ｖ1`
                                            }, { quoted: mekOption });

                                            // React to successful completion
                                            await conn.sendMessage(from, { react: { text: '✔', key: mekOption.key } });
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
                    await reply(`Please reply with a valid number from the list.`);
                }
            }
        });

    } catch (e) {
        reply('*Error occurred while scraping!*');
        console.error(e);
    }
});