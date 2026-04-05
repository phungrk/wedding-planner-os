export interface TelegramInboundInput {
  platformUserId: string;
  platformChatId: string;
  displayName: string;
  username?: string;
  text: string;
}
