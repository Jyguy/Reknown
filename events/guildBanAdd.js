async function logMessage (Client, guild, user) {
  const embed = new Client.Discord.MessageEmbed()
    .setTitle('Member Banned')
    .addField('Member', `${user.tag} (${user.id})`, true)
    .setThumbnail(user.displayAvatarURL({ size: 2048 }))
    .setColor(0xFF0000)
    .setTimestamp();

  if (guild.permissionsFor(Client.bot.user).has('VIEW_AUDIT_LOG')) {
    const entry = (await guild.fetchAuditLogs({
      user: user,
      type: 'MEMBER_BAN_ADD',
      limit: 1
    })).first();
    const executor = entry.executor;
    const reason = entry.reason || 'None';

    embed.setAuthor(`${executor.tag} (${executor.id})`, executor.displayAvatarURL())
      .addField('Reason', reason, true);
  }

  return require('../functions/sendlog.js')(Client, embed, guild.id);
};

module.exports = async (Client, guild, user) => {
  if (user === Client.bot.user) return;
  if (!guild || !guild.available) return;

  logMessage(Client, guild, user);
};
