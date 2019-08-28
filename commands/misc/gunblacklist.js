/**
 * @param {import('../../structures/client.js')} Client
 * @param {import('discord.js').Message} message
 * @param {String[]} args
*/
module.exports = async (Client, message, args) => {
  if (message.author.id !== Client.ownerID) return message.reply('Only the bot owner can use this command!');

  if (!args[1]) return Client.functions.get('argMissing')(message.channel, 1, 'a user to remove a global blacklist from');
  const user = await Client.getObj(args[1], { type: 'user' });
  if (!user) return Client.functions.get('argFix')(Client, message.channel, 1, 'User provided was invalid.');

  const exists = (await Client.sql.query('SELECT reason FROM gblacklist WHERE memberid = $1', [user.id])).rows[0];
  if (!exists) return message.reply('That user is not globally blacklisted!');

  Client.sql.query('DELETE FROM gblacklist WHERE memberid = $1', [user.id]);
  return message.channel.send(`Successfully removed a global blacklist from ${user.tag}.`);
};

module.exports.help = {
  name: 'gunblacklist',
  desc: 'Removes a global blacklist from a user.',
  category: 'misc',
  usage: '?gunblacklist <User>',
  aliases: ['gubl']
};
