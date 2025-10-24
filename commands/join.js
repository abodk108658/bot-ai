const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('يجعل البوت ينضم إلى القناة الصوتية التي أنت فيها.'),
    
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            return interaction.reply({ content: 'يجب أن تكون في قناة صوتية أولاً لكي أستطيع الانضمام!', ephemeral: true });
        }
        
        try {
            // الانضمام باستخدام دالة joinVoiceChannel
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true, // يفضل كتم الصوت
            });
            
            await interaction.reply({ content: `✅ انضممت بنجاح إلى الروم: **${voiceChannel.name}**!`, ephemeral: false });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '🚫 فشلت في الانضمام إلى القناة الصوتية.', ephemeral: true });
        }
    },
};
