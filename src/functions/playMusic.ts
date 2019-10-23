import { Guild } from 'discord.js';
import { Track } from 'lavalink';
import { MusicObject, ReknownClient } from 'ReknownBot';

module.exports = async (client: ReknownClient, guild: Guild, music: MusicObject, song: Track, ended?: boolean) => {
  if (!ended) {
    music.queue.push(song);
    if (music.queue.length > 1) return;
  }

  await music.player!.play(song.track);
  music.player!.setVolume(music.volume);

  music.player!.once('event', async d => {
    if (d.reason === 'REPLACED') return;
    if (!guild.voice || !guild.voice.channel) return client.functions.endSession(music);
    if (music.looping) music.queue.push(music.queue.shift()!);
    else music.queue.shift();

    if (music.queue.length > 0) return setTimeout(module.exports, 500, client, guild, music, music.queue[0], true);
    client.functions.endSession(music);
  });
};