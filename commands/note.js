const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('يمسح قائمة التشغيل الحالية ويشغل مقطع يوتيوب جديد فوراً.')
        .addStringOption(option =>
            option.setName('link_or_name')
                .setDescription('رابط يوتيوب أو اسم الأغنية/المقطع.')
                .setRequired(true)),

    // تمرير distube كـ 'player'
    async execute(interaction, player) { 
        // 1. التحقق من القناة الصوتية للمستخدم
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'يجب أن تكون في قناة صوتية أولاً.', ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const query = interaction.options.getString('link_or_name');
        
        await interaction.deferReply(); // إظهار رسالة "البوت يفكر"

        try {
            const queue = player.getQueue(guildId);

            // 2. إذا كانت هناك قائمة تشغيل، نقوم بمسحها لضمان تشغيل المقطع الجديد فوراً
            if (queue) {
                queue.stop(); // إيقاف التشغيل الحالي
            }
            
            // 3. تشغيل المقطع الجديد
            await player.play(
                voiceChannel,
                query,
                {
                    textChannel: interaction.channel,
                    skip: true // تجاوز أي قائمة انتظار سابقة
                }
            );

            await interaction.editReply({ 
                content: `✅ تم تغيير المقطع! جارٍ تشغيل \`${query}\` الآن.`, 
            });

        } catch (error) {
            console.error('حدث خطأ في أمر /note:', error);
            await interaction.editReply({ 
                content: '🚫 حدث خطأ ما أثناء محاولة تشغيل المقطع. تأكد من صحة الرابط أو اسم البحث.', 
                ephemeral: true 
            });
        }
    },
};
