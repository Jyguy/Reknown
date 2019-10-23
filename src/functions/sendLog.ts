import ReknownClient from '../structures/client';
import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { LogChannelRow, ToggleRow } from 'ReknownBot';

module.exports = async (client: ReknownClient, embed: MessageEmbed, guild: Guild) => {
  const toggledRow: ToggleRow = (await client.query('SELECT bool FROM togglelog WHERE guildid = $1', [ guild.id ])).rows[0];
  if (!toggledRow || !toggledRow.bool) return;

  const channelRow: LogChannelRow = (await client.query('SELECT channelid FROM logchannel WHERE guildid = $1', [ guild.id ])).rows[0];
  const channel = (channelRow ? client.channels.get(channelRow.channelid) : guild.channels.find(c => c.name === 'action-log' && c.type === 'text')) as TextChannel;
  if (!channel) return;
  if (!channel.permissionsFor(client.user!)!.has([ 'SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS' ])) return;

  channel.send(embed);
};