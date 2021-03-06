import type { PermissionString } from 'discord.js';
import type ReknownClient from '../../structures/client';
import type { GuildMessage, HelpObj } from 'ReknownBot';
import { errors, tables } from '../../Constants';

export async function run (client: ReknownClient, message: GuildMessage, args: string[]) {
  if (!args[1]) return client.functions.noArg(message, 1, 'a member to warn.');
  const member = await client.functions.parseMention(args[1], {
    guild: message.guild,
    type: 'member'
  }).catch(() => null);
  if (!member) return client.functions.badArg(message, 1, errors.UNKNOWN_MEMBER);
  if (member.user.bot) return client.functions.badArg(message, 1, 'You cannot warn a bot.');
  if (member.id === message.author.id) return client.functions.badArg(message, 1, 'You cannot warn yourself.');
  if (member.id === message.guild.ownerID) return client.functions.badArg(message, 1, 'The member provided is the owner.');
  if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerID) return client.functions.badArg(message, 1, errors.MEMBER_INSUFFICIENT_POSITION);

  const reason = args[2] ? args.slice(2).join(' ') : null;
  // eslint-disable-next-line no-extra-parens
  if ((reason?.length ?? 0) > 100) return client.functions.badArg(message, 2, 'The reason cannot be above 100 characters.');
  if (reason?.includes('\n')) return client.functions.badArg(message, 2, errors.NO_LINE_BREAKS);

  client.query(`INSERT INTO ${tables.WARNINGS} (guildid, userid, warnedat, warnedby, warnreason) VALUES ($1, $2, $3, $4, $5)`, [ message.guild.id, member.id, Date.now(), message.author.id, reason ]);
  message.channel.send(`Successfully warned \`\`${client.escInline(member.user.tag)}\`\` for \`\`${client.escInline(reason || 'None')}\`\`.`);
}

export const help: HelpObj = {
  aliases: [],
  category: 'Moderation',
  desc: 'Warns a member.',
  togglable: true,
  usage: 'warn <Member> [Reason]'
};

export const memberPerms: PermissionString[] = [
  'KICK_MEMBERS'
];

export const permissions: PermissionString[] = [];
