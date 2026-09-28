import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://chatapp-backend-zemv.onrender.com";

function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(0);
  const [messages, setMessages] = useState([]);

  // Controls mobile sidebar/chat visibility
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);

  const navigate = useNavigate();
  const stompClient = useRef(null);

  // ---------------- CURRENT USER ----------------

  useEffect(() => {
    fetch(`${API_URL}/api/users/me`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("User not authenticated");
        }

        return response.json();
      })
      .then((data) => {
        setCurrentUser(data);
        console.log("Current user:", data);
      })
      .catch((error) => {
        console.error("User fetch error:", error);
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
          throw new Error("Failed to fetch friends");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Accepted friends:", data);

        const friends = data.map((user) => ({
          id: user.id,
          name: user.username,
          message: "",
          time: "",
          online: false,
          avatar:
            user.username?.charAt(0).toUpperCase() || "?",
        }));

        console.log("Chats:", friends);

        setChats(friends);
      })
      .catch((error) => {
        console.error("Friends fetch error:", error);
        setChats([]);
      });
  }, [currentUser]);

  // ---------------- CURRENT CHAT ----------------

  const currentChat = chats[selectedChat];

  // ---------------- HANDLE CHAT SELECTION ----------------

  const handleSelectChat = (index) => {
    setSelectedChat(index);
    setShowSidebarMobile(false);
  };

  // ---------------- WEBSOCKET ----------------

  useEffect(() => {
    if (!currentUser) return;

    const socket = new SockJS(`${API_URL}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,

      connectHeaders: {
        userId: String(currentUser.id),
      },

      reconnectDelay: 5000,

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("WebSocket connected");

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
              JSON.parse(message.body);

            const newMessage = {
              id: `ws-${Date.now()}`,
              text: receivedMessage.content,
              sender:
                receivedMessage.senderId ===
                currentUser.id
                  ? "me"
                  : "other",
              time: new Date().toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
            };

            setMessages((previousMessages) => [
              ...previousMessages,
              newMessage,
            ]);
          }
        );

        // ---------------- PRESENCE SUBSCRIPTION ----------------

        const presenceDestination = "/topic/presence";

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
              JSON.parse(message.body);

            setChats((previousChats) =>
              previousChats.map((chat) => ({
                ...chat,
                online:
                  onlineUserIds.includes(chat.id),
              }))
            );
          }
        );

        // Tell backend that this user is online
        client.publish({
          destination: "/app/presence",
          body: JSON.stringify({
            userId: currentUser.id,
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
        console.log("WebSocket closed");
      },
    });

    stompClient.current = client;

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
    if (!currentUser || !currentChat) return;

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
          data.map((message) => ({
            id: message.id,
            text: message.content,
            sender:
              message.senderId === currentUser.id
                ? "me"
                : "other",
            time: new Date(
              message.timestamp
            ).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
          }));

        setMessages(formattedMessages);
      })
      .catch((error) => {
        console.error(
          "Message fetch error:",
          error
        );
      });
  }, [currentUser, currentChat]);

  // ---------------- SEND MESSAGE ----------------

  const handleSend = (text) => {
    console.log("Send clicked:", text);

    if (!currentUser) {
      console.error(
        "Current user not available"
      );
      return;
    }

    if (!currentChat) {
      console.error("No chat selected");
      return;
    }

    if (!stompClient.current?.connected) {
      console.error(
        "WebSocket is not connected"
      );
      return;
    }

    const message = {
      senderId: currentUser.id,
      receiverId: currentChat.id,
      sender: currentUser.name,
      content: text,
    };

    console.log(
      "Sending message:",
      message
    );

    stompClient.current.publish({
      destination: "/app/send",
      body: JSON.stringify(message),
    });

    // Show sent message immediately
    const sentMessage = {
      id: `local-${Date.now()}`,
      text: text,
      sender: "me",
      time: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      sentMessage,
    ]);
  };

  // ---------------- LOGOUT ----------------

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/");
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
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
          ${showSidebarMobile ? "flex" : "hidden"}
        `}
      >
        <Sidebar
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={handleSelectChat}
          currentUser={currentUser}
          handleLogout={handleLogout}
        />
      </div>

      {/* Chat Area */}

      <div
        className={`
          h-full min-w-0 flex-1
          ${showSidebarMobile ? "hidden md:flex" : "flex"}
        `}
      >
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            messages={messages}
            onSend={handleSend}
            onBack={() =>
              setShowSidebarMobile(true)
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