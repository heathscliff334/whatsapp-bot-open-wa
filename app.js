// const { create, Client } = require('@open-wa/wa-automate');

// create().then((client) => startBot(client));

// function startBot(client) {
//     client.onMessage((message) => {
//         if (message.body === 'hi') {
//             client.sendText(message.from, `Hello! This is your WhatsApp bot. \n timestamp: ${Date.now()}`);
//         }
//     });
// }

const wa = require('@open-wa/wa-automate');
const axios = require('axios'); // Import axios for HTTP requests

wa.create({
    sessionId: "COVID_HELPER",
    // multiDevice: true, //required to enable multiDevice support
    multiDevice: false,
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    // headless: true, //true
    headless: true,
    hostNotificationLang: 'PT_BR',
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Adjust path to where Chrome is installed

    logConsole: false,
    // deleteSessionDataOnLogout: true, // Automatically clear session data on logout
    popup: false,
    // popup: 3012, // Change this to an available port
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
    qrLogSkip: false, // Ensure QR is shown in terminal for scanning
}).then(client => start(client));

function start(client) {
    client.onMessage(async message => {
        if (message.body.toLowerCase() === 'hi') {
            const now = Date.now()
            await client.sendText(message.from, `👋 Hello!, timestamp ${now}`);
        } else if (message.body.startsWith('daftar')) {
            const details = extractDetails(message.body);
            if (details) {
                const response = `Name: ${details.name}\nDate: ${details.date}\nLocation: ${details.location}`;
                await client.sendText(message.from, response);
            } else {
                await client.sendText(message.from, 'Invalid format. Please use: daftar #name #date #location');
            }
        } else if (message.body.startsWith('!ask')) {
            const question = message.body.replace('!ask', '').trim(); // Extract the question after !ask:
            if (question) {
                try {
                    const response = await axios.post('http://localhost:3001/vertex-ask', { message: question });
                    // Assuming the API response contains a 'reply' field
                    const reply = response.data || 'Sorry, no response from the server.';
                    await client.sendText(message.from, reply);
                } catch (error) {
                    console.error('Error making HTTP request:', error);
                    await client.sendText(message.from, 'Error processing your request. Please try again.');
                }
            } else {
                await client.sendText(message.from, 'Please provide a message after !ask:.');
            }
        }
    });
}
function extractDetails(text) {
    const regex = /daftar\s+#([a-zA-Z\s]+)\s+#(\d{2}\/\d{2}\/\d{4})\s+#([a-zA-Z\s]+)/;
    const match = text.match(regex);
    if (match) {
        return {
            name: match[1].trim(),
            date: match[2].trim(),
            location: match[3].trim()
        };
    }
    return null;
}