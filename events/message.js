module.exports.run = async (client, message) => {
  if (message.author.bot || !message.guild || !message.guild.available) return;

  const prefix = await client.functions['getPrefix'].run(client, message.guild.id);
  if (!message.content.startsWith(prefix) || message.content === prefix) return;
  const args = message.content.slice(prefix.length).split(/ +/g);
  let cmd = args[0].toLowerCase();
  if (!Object.keys(client.aliases).includes(cmd)) return;
  cmd = client.aliases[cmd];

  return client.commands.get(cmd).run(client, message, args);
};
