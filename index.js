// ... (الجزء العلوي من index.js)

const { joinVoiceChannel } = require('@discordjs/voice'); // تأكد من استدعاء هذه الدالة في البداية

// ... (بقية الكود)

client.once('ready', () => {
    console.log(`البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);

    // === 🛠️ منطق الدخول التلقائي 24/7 ===
    
    // 1. **ضع هنا معرف (ID) الخادم (السيرفر) الخاص بك.**
    const GUILD_ID = '1323926281162588190';
    
    // 2. **ضع هنا معرف (ID) القناة الصوتية (الروم) التي تريد البوت أن يدخلها.**
    const VOICE_CHANNEL_ID = '1420820092761014363';

    const targetGuild = client.guilds.cache.get(GUILD_ID);

    if (targetGuild) {
        const targetChannel = targetGuild.channels.cache.get(VOICE_CHANNEL_ID);

        if (targetChannel && targetChannel.type === 2) { // التحقق من أن النوع هو قناة صوتية (Voice Channel)
            try {
                // استخدام joinVoiceChannel للانضمام إلى الروم
                joinVoiceChannel({
                    channelId: targetChannel.id,
                    guildId: targetGuild.id,
                    adapterCreator: targetGuild.voiceAdapterCreator,
                    selfDeaf: true, // يفضل كتم صوت البوت ذاتياً
                });
                console.log(`✅ انضم البوت تلقائياً إلى الروم: ${targetChannel.name}`);
                
                // **ملاحظة إضافية:** بعد الانضمام، يمكنك استخدام player.play() 
                // لتشغيل قائمة تشغيل 24/7 مباشرة.
                
            } catch (error) {
                console.error('🚫 فشل الانضمام التلقائي للقناة الصوتية:', error);
            }
        } else {
            console.log('🚫 لم يتم العثور على القناة الصوتية المحددة أو المعرف خاطئ.');
        }
    } else {
        console.log('🚫 لم يتم العثور على الخادم (السيرفر) المحدد أو المعرف خاطئ.');
    }
    
    // === نهاية منطق الدخول التلقائي ===
});

// ... (بقية الكود)
