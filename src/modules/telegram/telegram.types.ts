export interface TelegramUpdate {
  message?: {
    text?: string;
    from?: {
      id: number;
      first_name?: string;
      username?: string;
    };
    chat?: {
      id: number;
    };
  };
}
