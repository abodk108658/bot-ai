// 1. استدعاء المكتبات المطلوبة وقراءة متغيرات البيئة (مهم للأمان)
require('dotenv').config(); 
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { joinVoiceChannel } = require('@discordjs/voice');
const { SpotifyPlugin } = require('@distube/spotify'); // مثال على plugin
const fs = require('fs');
const path = require('path');

// 2. تعريف وإعداد البوت (Client) 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ],
}); 

// 3. تعريف مشغل الموسيقى، باستخدام المتغير "client"
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false, // لضمان بقاء البوت
    leaveOnStop: false,   // لضمان بقاء البوت
    plugins: [new SpotifyPlugin()] 
});

// 4. تحميل الأوامر
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command); 
    }
}

// 5. استخدام دالة client.once('ready', ...) (مع منطق الدخول 24/7)
client.once('ready', () => { 
    console.log(`✅ البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);

    // === منطق الدخول التلقائي 24/7 ===
    
    // ⚠️ يجب تغيير هذه المعرفات ⚠️
    const GUILD_ID = 1323926281162588190'; 
    const VOICE_CHANNEL_ID = '1420820092761014363';
    
    // ... (بقية منطق joinVoiceChannel كما ذكرنا سابقاً)
    // ... (تضمين منطق تشغيل الأغنية الأولية 24/7)
});

// 6. تسجيل الدخول باستخدام المتغير "client" (الطريقة الآمنة)
const TOKEN = process.env.DISCORD_TOKEN; // <== يتم قراءة الرمز من متغير البيئة

if (!TOKEN) {
    console.error("🚫 فشل تشغيل البوت: رمز البوت مفقود.");
    process.exit(1); 
}

client.login(TOKEN);
