// استدعاء المكتبات
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const fs = require('fs');
const path = require('path');

// إعداد البوت (Client)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, // مهم للتحكم بالقنوات الصوتية
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// تعريف مشغل الموسيقى (DisTube)
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false, // لمنع البوت من المغادرة بعد انتهاء الأغنية
    leaveOnStop: false,   // لمنع البوت من المغادرة عند أمر الإيقاف
    plugins: [new SpotifyPlugin()], // إضافة دعم سبوتيفاي اختياريًا
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// تحميل ملفات الأوامر
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[تحذير] الأمر في ${filePath} يفتقد خاصية 'data' أو 'execute' المطلوبة.`);
    }
}

// **إعداد الأوامر**
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`لم يتم العثور على أمر يطابق ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction, client.distube); // تمرير مشغل الموسيقى للأمر
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
    }
});

// **إعداد DisTube (للتشغيل التلقائي/24-7)**
client.distube.on('finish', (queue) => {
    // هذا الجزء يسمح بالتشغيل التلقائي لقائمة جديدة أو العودة إلى أغنية البقاء 24/7
    // إذا كنت تريد البوت أن يلعب شيئاً محدداً دائماً، ضع هنا قائمة تشغيل 24/7
    console.log(`انتهت قائمة التشغيل في الخادم ${queue.textChannel.guild.name}.`);
    // يمكنك إضافة منطق هنا لضمان بقاء البوت في القناة وتشغيل شيء جديد.
});

// إعداد رمز البوت (التوكن)
const TOKEN = 'MTM5MDgwNzA4MjQ1Nzg5NTAyMg.GtVvkU.7cBz79Z-Z0Xbv4ent-XlIu0QDGFn-lrmKMPyvI'; 

client.once('ready', () => {
    console.log(`البوت جاهز! تم تسجيل الدخول باسم ${client.user.tag}`);
    // يجب تسجيل الأوامر Slash Commands هنا أيضاً باستخدام Discord API
    // أو استخدم طريقة التسجيل التلقائي التي تفضلها.
});

client.login(TOKEN);
