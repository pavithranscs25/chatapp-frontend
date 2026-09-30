import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://chatapp-backend-zemv.onrender.com";

const SELECTED_CHAT_KEY =
  "chatapp-selected-chat-id";

const MOBILE_CHAT_KEY =
  "chatapp-mobile-chat-open";

function Chat() {
  const [currentUser, setCurrentUser] =
    useState(null);

  const [chats, setChats] =
    useState([]);

  const [selectedChat, setSelectedChat] =
    useState(0);

  const [messages, setMessages] =
    useState([]);

  const [unreadCounts, setUnreadCounts] =
    useState({});

  // Controls mobile sidebar/chat visibility
  const [showSidebarMobile, setShowSidebarMobile] =
    useState(() => {
      return (
        sessionStorage.getItem(
          MOBILE_CHAT_KEY
        ) !== "true"
      );
    });

  const navigate = useNavigate();

  const stompClient =
    useRef(null);

  // Keeps track of currently opened chat
  const currentChatIdRef =
    useRef(null);

  // ---------------- FORMAT TIME ----------------

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // ---------------- CURRENT USER ----------------

  useEffect(() => {
    fetch(`${API_URL}/api/users/me`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "User not authenticated"
          );
        }

        return response.json();
      })
      .then((data) => {
        setCurrentUser(data);

        console.log(
          "Current user:",
          data
        );
      })
      .catch((error) => {
        console.error(
          "User fetch error:",
          error
        );

        navigate("/");
      });
  }, [navigate]);

  // ---------------- FETCH ACCEPTED FRIENDS ----------------

  useEffect(() => {
    if (!currentUser) return;

    fetch(
      `${API_URL}/api/friend-requests/accepted/${currentUser.id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch friends"
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "Accepted friends:",
          data
        );

        const friends = data.map(
          (user) => ({
            id: user.id,
            name: user.username,
            message: "",
            time: "",
            online: false,
            avatar:
              user.username
                ?.charAt(0)
                .toUpperCase() ||
              "?",
          })
        );

        console.log(
          "Chats:",
          friends
        );

        // Restore previously selected chat
        const savedChatId =
          sessionStorage.getItem(
            SELECTED_CHAT_KEY
          );

        let restoredIndex = 0;

        if (savedChatId) {
          const foundIndex =
            friends.findIndex(
              (friend) =>
                String(friend.id) ===
                String(savedChatId)
            );

          if (foundIndex !== -1) {
            restoredIndex =
              foundIndex;
          }
        }

        setChats(friends);
        setSelectedChat(
          restoredIndex
        );
      })
      .catch((error) => {
        console.error(
          "Friends fetch error:",
          error
        );

        setChats([]);
      });
  }, [currentUser]);

  // ---------------- CURRENT CHAT ----------------

  const currentChat =
    chats[selectedChat];

  // Keep current chat ID in a ref
  useEffect(() => {
    currentChatIdRef.current =
      currentChat?.id ?? null;
  }, [currentChat]);

  // ---------------- HANDLE CHAT SELECTION ----------------

  const handleSelectChat = (index) => {
    const selected =
      chats[index];

    setSelectedChat(index);

    // Save chat ID
    if (selected?.id != null) {
      sessionStorage.setItem(
        SELECTED_CHAT_KEY,
        String(selected.id)
      );

      // Clear unread count
      setUnreadCounts(
        (previousCounts) => ({
          ...previousCounts,
          [selected.id]: 0,
        })
      );
    }

    // On mobile, open chat window
    setShowSidebarMobile(
      false
    );

    sessionStorage.setItem(
      MOBILE_CHAT_KEY,
      "true"
    );
  };

  // ---------------- WEBSOCKET ----------------

  useEffect(() => {
    if (!currentUser) return;

    const socket = new SockJS(
      `${API_URL}/ws`
    );

    const client = new Client({
      webSocketFactory: () => socket,

      connectHeaders: {
        userId: String(
          currentUser.id
        ),
      },

      reconnectDelay: 5000,

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log(
          "WebSocket connected"
        );

        // ---------------- MESSAGE SUBSCRIPTION ----------------

        const messageDestination =
          `/topic/messages/${currentUser.id}`;

        console.log(
          "Subscribing to:",
          messageDestination
        );

        client.subscribe(
          messageDestination,
          (message) => {
            console.log(
              "MESSAGE RECEIVED:",
              message.body
            );

            const receivedMessage =
              JSON.parse(
                message.body
              );

            const senderId =
              receivedMessage.senderId;

            const isOwnMessage =
              senderId ===
              currentUser.id;

            const messageTime =
              formatMessageTime(
                new Date()
              );

            // ---------------- UPDATE CHAT PREVIEW ----------------

            setChats(
              (previousChats) =>
                previousChats.map(
                  (chat) => {
                    if (
                      String(chat.id) ===
                      String(
                        senderId
                      )
                    ) {
                      return {
                        ...chat,
                        message:
                          receivedMessage.content,
                        time:
                          messageTime,
                      };
                    }

                    // For own sent message,
                    // update the currently selected friend's preview.
                    if (
                      isOwnMessage &&
                      currentChatIdRef.current &&
                      String(chat.id) ===
                        String(
                          currentChatIdRef.current
                        )
                    ) {
                      return {
                        ...chat,
                        message:
                          receivedMessage.content,
                        time:
                          messageTime,
                      };
                    }

                    return chat;
                  }
                )
            );

            // ---------------- UNREAD COUNT ----------------

            if (
              !isOwnMessage &&
              String(senderId) !==
                String(
                  currentChatIdRef.current
                )
            ) {
              setUnreadCounts(
                (previousCounts) => ({
                  ...previousCounts,
                  [senderId]:
                    (previousCounts[
                      senderId
                    ] || 0) + 1,
                })
              );
            }

            // ---------------- ADD MESSAGE ----------------

            const newMessage = {
              id: `ws-${Date.now()}`,

              text:
                receivedMessage.content,

              sender:
                isOwnMessage
                  ? "me"
                  : "other",

              time:
                messageTime,
            };

            setMessages(
              (previousMessages) => [
                ...previousMessages,
                newMessage,
              ]
            );
          }
        );

        // ---------------- PRESENCE SUBSCRIPTION ----------------

        const presenceDestination =
          "/topic/presence";

        console.log(
          "Subscribing to:",
          presenceDestination
        );

        client.subscribe(
          presenceDestination,
          (message) => {
            console.log(
              "PRESENCE UPDATE:",
              message.body
            );

            const onlineUserIds =
              JSON.parse(
                message.body
              );

            setChats(
              (previousChats) =>
                previousChats.map(
                  (chat) => ({
                    ...chat,
                    online:
                      onlineUserIds.includes(
                        chat.id
                      ),
                  })
                )
            );
          }
        );

        // Tell backend that this user is online
        client.publish({
          destination:
            "/app/presence",

          body: JSON.stringify({
            userId:
              currentUser.id,
          }),
        });
      },

      onStompError: (frame) => {
        console.error(
          "STOMP ERROR:",
          frame.headers["message"]
        );

        console.error(
          "STOMP DETAILS:",
          frame.body
        );
      },

      onWebSocketError: (error) => {
        console.error(
          "WebSocket error:",
          error
        );
      },

      onWebSocketClose: () => {
        console.log(
          "WebSocket closed"
        );
      },
    });

    stompClient.current =
      client;

    client.activate();

    return () => {
      console.log(
        "Cleaning up WebSocket..."
      );

      if (client.active) {
        client.deactivate();
      }
    };
  }, [currentUser]);

  // ---------------- FETCH CHAT HISTORY ----------------

  useEffect(() => {
    if (
      !currentUser ||
      !currentChat
    ) {
      return;
    }

    fetch(
      `${API_URL}/api/messages/${currentUser.id}/${currentChat.id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch messages"
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "Chat history:",
          data
        );

        const formattedMessages =
          data.map(
            (message) => ({
              id: message.id,

              text:
                message.content,

              sender:
                message.senderId ===
                currentUser.id
                  ? "me"
                  : "other",

              time:
                formatMessageTime(
                  new Date(
                    message.timestamp
                  )
                ),
            })
          );

        setMessages(
          formattedMessages
        );

        // ---------------- UPDATE LATEST CHAT PREVIEW ----------------

        if (data.length > 0) {
          const latestMessage =
            data[data.length - 1];

          setChats(
            (previousChats) =>
              previousChats.map(
                (chat) => {
                  if (
                    String(chat.id) ===
                    String(
                      currentChat.id
                    )
                  ) {
                    return {
                      ...chat,
                      message:
                        latestMessage.content,
                      time:
                        formatMessageTime(
                          new Date(
                            latestMessage.timestamp
                          )
                        ),
                    };
                  }

                  return chat;
                }
              )
          );
        } else {
          // No messages yet
          setChats(
            (previousChats) =>
              previousChats.map(
                (chat) => {
                  if (
                    String(chat.id) ===
                    String(
                      currentChat.id
                    )
                  ) {
                    return {
                      ...chat,
                      message: "",
                      time: "",
                    };
                  }

                  return chat;
                }
              )
          );
        }
      })
      .catch((error) => {
        console.error(
          "Message fetch error:",
          error
        );
      });
  }, [
    currentUser,
    currentChat,
  ]);

  // ---------------- SEND MESSAGE ----------------

  const handleSend = (text) => {
    console.log(
      "Send clicked:",
      text
    );

    if (!currentUser) {
      console.error(
        "Current user not available"
      );

      return;
    }

    if (!currentChat) {
      console.error(
        "No chat selected"
      );

      return;
    }

    if (
      !stompClient.current
        ?.connected
    ) {
      console.error(
        "WebSocket is not connected"
      );

      return;
    }

    const message = {
      senderId:
        currentUser.id,

      receiverId:
        currentChat.id,

      sender:
        currentUser.name,

      content: text,
    };

    console.log(
      "Sending message:",
      message
    );

    stompClient.current.publish({
      destination:
        "/app/send",

      body: JSON.stringify(
        message
      ),
    });

    const messageTime =
      formatMessageTime(
        new Date()
      );

    // ---------------- UPDATE CHAT PREVIEW ----------------

    setChats(
      (previousChats) =>
        previousChats.map(
          (chat) => {
            if (
              String(chat.id) ===
              String(
                currentChat.id
              )
            ) {
              return {
                ...chat,
                message: text,
                time: messageTime,
              };
            }

            return chat;
          }
        )
    );

    // Show sent message immediately
    const sentMessage = {
      id: `local-${Date.now()}`,

      text: text,

      sender: "me",

      time: messageTime,
    };

    setMessages(
      (previousMessages) => [
        ...previousMessages,
        sentMessage,
      ]
    );
  };

  // ---------------- LOGOUT ----------------

  const handleLogout = async () => {
    try {
      const response =
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method: "POST",
            credentials: "include",
          }
        );

      if (response.ok) {
        sessionStorage.removeItem(
          SELECTED_CHAT_KEY
        );

        sessionStorage.removeItem(
          MOBILE_CHAT_KEY
        );

        setUnreadCounts({});

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // ---------------- MOBILE BACK ----------------

  const handleBackToSidebar = () => {
    setShowSidebarMobile(
      true
    );

    sessionStorage.setItem(
      MOBILE_CHAT_KEY,
      "false"
    );
  };

  // ---------------- UI ----------------

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-gray-50 text-gray-900">

      {/* Sidebar */}

      <div
        className={`
          h-full w-full shrink-0
          md:flex md:w-72
          lg:w-80
          ${
            showSidebarMobile
              ? "flex"
              : "hidden"
          }
        `}
      >
        <Sidebar
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={
            handleSelectChat
          }
          currentUser={
            currentUser
          }
          handleLogout={
            handleLogout
          }
          unreadCounts={
            unreadCounts
          }
        />
      </div>

      {/* Chat Area */}

      <div
        className={`
          h-full min-w-0 flex-1
          ${
            showSidebarMobile
              ? "hidden md:flex"
              : "flex"
          }
        `}
      >
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            messages={messages}
            onSend={handleSend}
            onBack={
              handleBackToSidebar
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-gray-500">
            No friends yet.
          </div>
        )}
      </div>

    </div>
  );
}

export default Chat;