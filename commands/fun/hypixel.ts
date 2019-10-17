import { ReknownClient } from 'ReknownBot';
import { Message, TextChannel, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { Response } from 'node-fetch';
import { stringify } from 'querystring';
import { Player } from 'Hypixel-API';

interface UUIDJson {
  id: string;
  name: string;
}

const hypixelEndpoint = 'https://api.hypixel.net';
const minecraftEndpoint = 'https://api.mojang.com';

module.exports.run = async (client: ReknownClient, message: Message, args: string[]) => {
  if (message.channel instanceof TextChannel && !message.channel.permissionsFor(client.user!)!.has('EMBED_LINKS')) return client.functions.noClientPerms(message, [ 'Embed Links' ], message.channel);

  if (!args[1]) return client.functions.noArg(message, 1, 'a type of statistic to look up, it can be: player.');
  if (!args[2]) return client.functions.noArg(message, 2, 'a value to search by.');

  switch (args[1].toLowerCase()) {
    case 'player': {
      const uuidRes: Response | false = await fetch(`${minecraftEndpoint}/users/profiles/minecraft/${args[2]}`).catch(() => false);
      if (uuidRes === false) return client.functions.badArg(message, 1, 'That Minecraft player does not exist.');
      const uuidJson: UUIDJson = await uuidRes.json();
      const uuid = uuidJson.id;

      const queries = stringify({
        key: process.env.HYPIXEL_KEY,
        uuid: uuid
      });
      const hypixelJson: { success: boolean; player: Player } = await fetch(`${hypixelEndpoint}/player?${queries}`).then(res => res.json());
      if (!hypixelJson.success) return client.functions.badArg(message, 2, 'That player has not joined the server yet, or the request has failed.');
      const { player } = hypixelJson;
      const embed = new MessageEmbed()
        .addField('Network XP', client.functions.formatNum(player.networkExp), true)
        .addField('Karma', client.functions.formatNum(player.karma), true)
        .addField('Achievement Points', client.functions.formatNum(player.achievementPoints), true)
        .addField('Total Votes', client.functions.formatNum(player.voting.total), true)
        .addField('Pet Food Count', client.functions.formatNum(Object.values(player.petConsumables).reduce((a, b) => a + b, 0)), true)
        .setColor(client.config.embedColor)
        .setAuthor(`General Stats for ${player.displayname}`, undefined, `https://hypixel.net/player/${player.displayname}`);

      message.channel.send(embed);
      break;
    }

    // no default
  }
};

module.exports.help = {
  aliases: [],
  category: 'Fun',
  desc: 'Gets a variety of stats from the Minecraft server [Hypixel](https://hypixel.net/).',
  usage: 'hypixel <"player"> <In-Game Name>'
};