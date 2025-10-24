// 1. استدعاء المكتبات المطلوبة وقراءة متغيرات البيئة (مهم للأمان)
require('dotenv').config(); 
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { joinVoiceChannel } = require('@discordjs/voice');
const { SpotifyPlugin } = require('@distube/spotify');
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
    } else {
        console.warn(`[تحذير] الأمر في ${filePath} يفتقد خاصية 'data' أو 'execute' المطلوبة.`);
    }
}

// 5. استخدام دالة client.once('ready', ...) (مع منطق الدخول 24/7)
client.once('ready', () => { 
    console.log(`✅ البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);

    // === منطق الدخول التلقائي 24/7 ===
    
    // ⚠️ تم إصلاح علامة التنصيص المفقودة في هذا السطر
    const GUILD_ID = '1323926281162588190'; 
    const VOICE_CHANNEL_ID = '1420820092761014363'; // المعرف الذي أرسلته

    const targetGuild = client.guilds.cache.get(GUILD_ID);

    if (targetGuild) {
        const targetChannel = targetGuild.channels.cache.get(VOICE_CHANNEL_ID);

        if (targetChannel && targetChannel.type === 2) { 
            try {
                // الانضمام إلى الروم
                joinVoiceChannel({
                    channelId: targetChannel.id,
                    guildId: targetGuild.id,
                    adapterCreator: targetGuild.voiceAdapterCreator,
                    selfDeaf: true,
                });
                console.log(`✅ انضم البوت تلقائياً إلى الروم: ${targetChannel.name}`);
                
                // **تشغيل مقطع تمهيدي لضمان استمرار البوت في الروم (يمكنك تغيير الرابط)**
                const initialMusicLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // مثال على رابط
                
                client.distube.play(targetChannel, initialMusicLink, {
                    textChannel: targetChannel.guild.systemChannel || targetChannel.guild.channels.cache.find(c => c.type === 0),
                    skip: true 
                }).catch(err => console.error('🚫 فشل تشغيل موسيقى 24/7 الأولية:', err));
                
            } catch (error) {
                console.error('🚫 فشل الانضمام التلقائي للقناة الصوتية:', error);
            }
        } else {
            console.warn('🚫 لم يتم العثور على القناة الصوتية المحددة أو المعرف خاطئ.');
        }
    } else {
        console.warn('🚫 لم يتم العثور على الخادم (السيرفر) المحدد أو المعرف خاطئ.');
    }
});

// 6. تسجيل الدخول باستخدام المتغير "client" (الطريقة الآمنة)
const TOKEN = process.env.DISCORD_TOKEN; // <== يتم قراءة الرمز من متغير البيئة

if (!TOKEN) {
    console.error("🚫 فشل تشغيل البوت: رمز البوت مفقود. يرجى وضعه في متغير بيئة DISCORD_TOKEN.");
    process.exit(1); 
}

client.login(TOKEN);
