// 1. استدعاء المكتبات المطلوبة (مثل Client)
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
// ... (بقية المكتبات)

// 2. تعريف وإعداد البوت (هذا هو السطر المهم الذي يجب أن يكون في البداية)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        // ... (بقية الـ Intents)
    ],
}); 

// 3. تعريف مشغل الموسيقى، باستخدام المتغير "client"
client.distube = new DisTube(client, {
    // ...
});

// 4. تحميل الأوامر واستخدام المتغير "client"
client.commands = new Collection();
// ... (منطق تحميل الأوامر)

// 5. استخدام دالة client.once('ready', ...) في السطر السابع أو ما بعده
client.once('ready', () => { // <== يجب أن يكون client مُعرَّفاً هنا
    console.log(`البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);
    // ... (منطق الدخول التلقائي)
});

// 6. تسجيل الدخول باستخدام المتغير "client"
const TOKEN = 'MTM5MDgwNzA4MjQ1Nzg5NTAyMg.GtVvkU.7cBz79Z-Z0Xbv4ent-XlIu0QDGFn-lrmKMPyvI'; 
client.login(TOKEN);
