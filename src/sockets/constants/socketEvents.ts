export const SOCKET_EVENTS = {

  GET_CONVERSATIONS: "getConversations",
  EXISTING_CONVERSATIONS: "existingConversations",

  START_CONVERSATION: "startConversation",
  CONVERSATION_STARTED: "conversationStarted",

  GROUP_CONVERSATION: "groupConversation",
  GROUP_STARTED: "groupConversationStarted",

  SEND_MESSAGE: "sendMessage",
  NEW_MESSAGE: "newMessage",

  TYPING: "typing",

  ADD_MEMBER: "addGroupMember",
  MEMBER_ADDED: "memberAdded",

  REMOVE_MEMBER: "removeGroupMember",
  MEMBER_REMOVED: "memberRemoved",

  CHANGE_ADMIN: "changeAdmin",
  ADMIN_CHANGED: "adminChanged",

  READ_MESSAGES: "readMessages",
  MESSAGES_READ: "messagesRead",

  ERROR: "error"
};