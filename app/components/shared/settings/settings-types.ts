export type SettingsSectionId =
  | "privacy"
  | "account-status"
  | "more-settings"
  | "help";

export interface MutedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutedDate: string;
}

export interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  blockedDate: string;
}

export interface PrivacySettingsState {
  isPrivateProfile: boolean;
  mentionSetting: "everyone" | "following" | "none";
  hideLikesAndShares: boolean;
  activeStatus: boolean;
  filterOffensiveComments: boolean;
  customHiddenWords: string[];
  mutedUsers: MutedUser[];
  blockedUsers: BlockedUser[];
}

export interface MoreSettingsState {
  pauseAllNotifications: boolean;
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyFollows: boolean;
  notifyMessages: boolean;
  appearance: "light" | "dark" | "system";
  uploadHighestQuality: boolean;
  dataSaver: boolean;
  language: "id" | "en";
  unitSystem: "metric" | "imperial";
  twoFactorAuth: boolean;
}

export interface SupportTicket {
  id: string;
  title: string;
  category: string;
  status: "open" | "resolved" | "investigating";
  date: string;
}
