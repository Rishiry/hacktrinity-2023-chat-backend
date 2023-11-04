import { connection } from '../lib/database';

async function createSpaceStream(spaceId: string): Promise<void> {
  const streamKey = `space:${spaceId}:chat`;
  await connection.xGroup('CREATE', streamKey, 'chat-group', '$', 'MKSTREAM');
}

async function listenToChats(spaceId: string): Promise<void> {
  const streamKey = `space:${spaceId}:chat`;
  while (true) {
    const messages = await connection.xReadGroup('GROUP', 'chat-group', 'consumer', 'STREAMS', streamKey, '>');
    for (const message of messages) {
      // Process message...
    }
  }
}

async function addChat(spaceId: string, message: string, sender: string): Promise<void> {
  const streamKey = `space:${spaceId}:chat`;
  await connection.xAdd(streamKey, '*', 'message', message, 'sender', sender);
}

async function getOlderChats(spaceId: string, lastTimestamp: string, count: number = 50): Promise<any[]> {
  const streamKey = `space:${spaceId}:chat`;
  const messages = await connection.xRange(streamKey, '-', lastTimestamp, 'COUNT', count);
  return messages;
}

export { createSpaceStream, listenToChats, addChat, getOlderChats }
