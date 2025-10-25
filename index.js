// 1. استدعاء المكتبات المطلوبة
require('dotenv').config(); 
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { joinVoiceChannel } = require('@discordjs/voice');
const { SpotifyPlugin } = require('@distube/spotify');
const fs = require('fs');
const path = require('path');

// 2. تحديد البادئة (الـ Prefix)
const PREFIX = '702'; // <== التغيير المطلوب في البادئة هنا

// 3. تعريف وإعداد البوت (Client) 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ],
}); 

// 4. تعريف مشغل الموسيقى
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false, // عشان البوت ما يطلع
    leaveOnStop: false,   // عشان البوت ما يطلع
    plugins: [new SpotifyPlugin()] 
});

// 5. عند جاهزية البوت (منطق الدخول 24/7)
client.once('ready', () => { 
    console.log(`✅ البوت جاهز! سجل دخوله باسم ${client.user.tag}`);

    // === منطق الدخول التلقائي 24/7 ===
    const GUILD_ID = '1323926281162588190'; 
    const VOICE_CHANNEL_ID = '1420820092761014363';

    const targetGuild = client.guilds.cache.get(GUILD_ID);

    if (targetGuild) {
        const targetChannel = targetGuild.channels.cache.get(VOICE_CHANNEL_ID);

        if (targetChannel && targetChannel.type === 2) { 
            try {
                joinVoiceChannel({
                    channelId: targetChannel.id,
                    guildId: targetGuild.id,
                    adapterCreator: targetGuild.voiceAdapterCreator,
                    selfDeaf: true,
                });
                console.log(`✅ دخل البوت القناة: ${targetChannel.name}`);
                
                // تشغيل مقطع تمهيدي عشان يثبت في القناة
                const initialMusicLink = 'https://www.youtube.com/watch?v=jRWR0Ob6mLI'; 
                
                client.distube.play(targetChannel, initialMusicLink, {
                    textChannel: targetChannel.guild.systemChannel || targetChannel.guild.channels.cache.find(c => c.type === 0),
                    skip: true 
                }).catch(err => console.error('🚫 ما قدرنا نشغل الموسيقى الاولية:', err));
                
            } catch (error) {
                console.error('🚫 فشل الدخول التلقائي للقناة الصوتية:', error);
            }
        } else {
            console.warn('🚫 ما لقينا القناة الصوتية اللي حاطها او المعرف خطا.');
        }
    } else {
        console.warn('🚫 ما لقينا السيرفر اللي حاطه او المعرف خطا.');
    }
});

// 6. قائمة التشغيل حقتنا (اضف مقاطعك هنا)
const CUSTOM_PLAYLIST = [
    'https://www.youtube.com/watch?v=zgp_sFRlECs', 
    'https://www.youtube.com/watch?v=2CMoyNf4_1M&t=2022s',
    'اسم اغنية او مقطع للبحث عنه',
    // تقدر تحط اي عدد من الروابط او الاسامي
];


// 7. معالجة الأوامر بنظام البادئة (Prefix)
client.on('messageCreate', async message => {
    // نتجاهل رسائل البوتات او الرسائل اللي ما تبدا بالبادئة
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // نستخرج الامر والمحتوى
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase(); 

    // === 1. امر 702note (تشغيل مقطع جديد) ===
    if (commandName === 'note') {
        const voiceChannel = message.member.voice.channel;
        const query = args.join(' '); 
        
        if (!voiceChannel) {
            return message.reply('لازم تكون بقناة صوتية اول شيء.');
        }

        if (!query) {
             return message.reply('تكفى حط رابط يوتيوب او اسم المقطع بعد الامر.');
        }

        try {
            const queue = client.distube.getQueue(message.guild.id);

            if (queue) {
                queue.stop(); 
            }
            
            await client.distube.play(
                voiceChannel,
                query,
                {
                    textChannel: message.channel,
                    skip: true 
                }
            );

            message.reply(`✅ تم تغيير المقطع بنجاح! شغلنا \`${query}\` الحين.`);

        } catch (error) {
            console.error('🚫 صار خطا في امر note:', error);
            message.reply('🚫 صار فيه خطا بسيط يوم نحاول نشغل المقطع. تأكد من صحة الرابط.');
        }
    }
    
    // === 2. امر 702list (يشغل القائمة كلها) ===
    if (commandName === 'list') {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('لازم تكون بقناة صوتية عشان تشغل القائمة.');
        }

        try {
            await message.reply('🔄 جاري اضافة الاغاني من قائمة التشغيل حقتك...');
            
            // نمسح قائمة الانتظار الحالية قبل اضافة القائمة الجديدة
            const queue = client.distube.getQueue(message.guild.id);
            if (queue) {
                queue.stop();
            }

            // نشغل اول اغنية ونضيف الباقي لقائمة الانتظار
            await client.distube.play(voiceChannel, CUSTOM_PLAYLIST[0], {
                textChannel: message.channel,
                skip: true 
            });

            for (let i = 1; i < CUSTOM_PLAYLIST.length; i++) {
                await client.distube.add(message.guild.id, CUSTOM_PLAYLIST[i]);
            }
            
            message.channel.send(`✅ خلاص ضفنا ${CUSTOM_PLAYLIST.length} مقطع لقائمة الانتظار وشغلنا.`);

        } catch (error) {
            console.error('🚫 صار خطا في امر list:', error);
            message.reply('🚫 ما قدرنا نشغل قائمة التشغيل.');
        }
    }

    // === 3. امر 702random (يشغل مقطع واحد عشوائي) ===
    if (commandName === 'random') {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('لازم تكون بقناة صوتية عشان تشغل مقطع عشوائي.');
        }

        try {
            // نختار مقطع عشوائي من القائمة
            const randomIndex = Math.floor(Math.random() * CUSTOM_PLAYLIST.length);
            const randomSong = CUSTOM_PLAYLIST[randomIndex];

            // نمسح قائمة الانتظار الحالية
            const queue = client.distube.getQueue(message.guild.id);
            if (queue) {
                queue.stop(); 
            }

            await client.distube.play(
                voiceChannel,
                randomSong,
                {
                    textChannel: message.channel,
                    skip: true 
                }
            );

            message.reply(`🎲 اخترنا مقطع عشوائي! شغلنا \`${randomSong}\` الحين.`);

        } catch (error) {
            console.error('🚫 صار خطا في امر random:', error);
            message.reply('🚫 ما قدرنا نشغل المقطع العشوائي.');
        }
    }
});


// 8. تسجيل الدخول (آمن)
const TOKEN = process.env.DISCORD_TOKEN; 

if (!TOKEN) {
    console.error("🚫 ما اشتغل البوت: الرمز حقه ضايع.");
    process.exit(1); 
}

client.login(TOKEN);
