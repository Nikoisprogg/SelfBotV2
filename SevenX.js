// SevenX.js
// WhatsApp SelfBot - SevenX AI
// Menggunakan: https://github.com/kiuur/bails
import { createBails } from 'bails';

// Inisialisasi bot
const client = createBails({
  takeoverOnConflict: true,
  printQRInTerminal: false,
  auth: 'auth_info',
  options: {
    defaultDeviceName: 'SevenX AI - SelfBot'
  }
});

// Store untuk semua command (case)
let CASES = {};

// --- 🔧 Default Commands ---
CASES.menu = async ({ client, message }) => {
  const senderName = message.sender?.name || 'User';
  const commands = Object.keys(CASES).sort();

  const menuText = `
🤖 *SevenX AI - SelfBot*
👋 *Halo*, ${senderName}!
📁 *Total Perintah*: ${commands.length}

📋 *Daftar Perintah*:
${commands.map(cmd => `  › .${cmd}`).join('\n')}

🔧 *Fitur Admin*:
• .addcase [nama] [kode] → Tambah perintah JS
• .delcase [nama] → Hapus perintah

💡 Contoh:
.addcase test "client.sendMessage(message.from, { text: 'Hello!' });"
  `.trim();

  await client.sendMessage(message.from, { text: menuText });
};

CASES.addcase = async ({ client, message, args }) => {
  const reply = (text) => client.sendMessage(message.from, { text });

  if (args.length < 3) {
    return reply('❌ Format: .addcase [nama] [kode_javascript]');
  }

  const caseName = args[1].toLowerCase().trim();
  const codeStr = args.slice(2).join(' ');

  if (!/^[a-zA-Z0-9_]+$/.test(caseName)) {
    return reply('❌ Nama command hanya boleh huruf, angka, dan underscore.');
  }

  if (['addcase', 'delcase', 'menu'].includes(caseName)) {
    return reply(`🔒 Command *${caseName}* dilindungi.`);
  }

  try {
    new Function('client', 'message', 'args', codeStr); // Validasi sintaks

    CASES[caseName] = async (params) => {
      const { client, message } = params;
      const freshArgs = message.body.slice(1).trim().split(/ +/);
      try {
        await new Function('client', 'message', 'args', codeStr)(client, message, freshArgs);
      } catch (err) {
        await reply(`❌ Error eksekusi: ${err.message}`);
      }
    };

    await reply(`✅ Berhasil tambah command: *${caseName}*`);
  } catch (err) {
    await reply(`❌ Gagal parse kode: ${err.message}`);
  }
};

CASES.delcase = async ({ client, message, args }) => {
  const reply = (text) => client.sendMessage(message.from, { text });

  if (args.length < 2) {
    return reply('❌ Gunakan: .delcase [nama]');
  }

  const caseName = args[1].toLowerCase().trim();

  if (!CASES[caseName]) {
    return reply(`❌ Command *${caseName}* tidak ditemukan.`);
  }

  if (['addcase', 'delcase', 'menu'].includes(caseName)) {
    return reply(`🔒 Tidak bisa hapus command sistem.`);
  }

  delete CASES[caseName];
  await reply(`🗑️ Command *${caseName}* berhasil dihapus.`);
};

// --- 📡 Event Handler ---

client.on('pairingCode', (phoneNumber) => {
  console.log('===================================');
  console.log('🔐 MASUKKAN KODE PASANGAN');
  console.log(`📱 Nomor: ${phoneNumber}`);
  console.log('➡️  Buka: WhatsApp > Perangkat Tertaut > Pasangkan Perangkat');
  console.log('💬 Masukkan 6-digit kode yang muncul');
  console.log('===================================');
});

client.on('ready', () => {
  console.log('===================================');
  console.log(`🚀 SevenX AI telah aktif!`);
  console.log(`📱 Terhubung sebagai: ${client.user.id.split('@')[0]}`);
  console.log('💬 Kirim .menu untuk melihat daftar perintah');
  console.log('===================================');
});

client.on('message', async (message) => {
  try {
    const { from, body, isGroup } = message;

    // Cek tag di grup
    const isTagged = isGroup && body.includes(`@${client.user.id.split('@')[0]}`);
    if (isGroup && !isTagged) return;

    // Normalisasi perintah
    let cleanBody = body;
    if (isTagged) {
      cleanBody = cleanBody.replace(new RegExp(`@${client.user.id.split('@')[0]}`, 'g'), '').trim();
    }
    cleanBody = cleanBody.trim();

    if (!cleanBody.startsWith('.')) return;

    const args = cleanBody.slice(1).trim().split(/ +/);
    const command = args[0].toLowerCase();

    if (CASES[command]) {
      await CASES[command]({ client, message, args });
    }
  } catch (err) {
    console.error('[ERROR]', err);
    try {
      await client.sendMessage(message.from, {
        text: `❌ Error: ${err.message}`
      });
    } catch (e) {
      console.error('[FATAL]', e);
    }
  }
});

// Jalankan bot
console.log('🚀 Menjalankan SevenX AI... Menunggu pairing code');