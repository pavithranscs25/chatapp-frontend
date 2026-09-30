import React, {
  useEffect,
  useRef,
} from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import Message from "./Message";
import MessageInput from "./MessageInput";

function ChatWindow({
  chat,
  chatDisplayName,
  messages,
  onSend,
  onBack,
}) {
  const messagesContainerRef =
    useRef(null);

  const restoredChatRef =
    useRef(null);

  const scrollStorageKey =
    `chatapp-scroll-position-${chat.id}`;

  // ---------------- RESTORE SCROLL POSITION ----------------

  useEffect(() => {
    if (!chat?.id) return;

    if (
      restoredChatRef.current !==
      chat.id
    ) {
      restoredChatRef.current = null;
    }

    if (messages.length === 0) {
      return;
    }

    if (
      restoredChatRef.current ===
      chat.id
    ) {
      return;
    }

    const savedPosition =
      sessionStorage.getItem(
        scrollStorageKey
      );

    if (savedPosition !== null) {
      const scrollPosition =
        Number(savedPosition);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            messagesContainerRef.current
          ) {
            messagesContainerRef.current.scrollTop =
              scrollPosition;
          }
        });
      });
    }

    restoredChatRef.current =
      chat.id;
  }, [
    chat?.id,
    messages.length,
    scrollStorageKey,
  ]);

  // ---------------- SAVE SCROLL POSITION ----------------

  const handleMessagesScroll = () => {
    const container =
      messagesContainerRef.current;

    if (
      !container ||
      !chat?.id
    ) {
      return;
    }

    sessionStorage.setItem(
      scrollStorageKey,
      String(
        container.scrollTop
      )
    );
  };

  // ---------------- SAVE BEFORE LEAVING ----------------

  useEffect(() => {
    return () => {
      const container =
        messagesContainerRef.current;

      if (
        !container ||
        !chat?.id
      ) {
        return;
      }

      sessionStorage.setItem(
        scrollStorageKey,
        String(
          container.scrollTop
        )
      );
    };
  }, [
    chat?.id,
    scrollStorageKey,
  ]);

  return (
    <div className="flex h-full w-full min-w-0 flex-col bg-gray-50">

      {/* Chat Header */}

      <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:h-20 sm:px-4 md:px-6">

        {/* User Details */}

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          {/* Back Button - Mobile */}

          <button
            type="button"
            onClick={onBack}
            className="mr-1 rounded-full p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}

          <div className="relative shrink-0">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white sm:h-11 sm:w-11">
              {chat.avatar}
            </div>

            {chat.online && (
              <span
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 sm:h-3.5 sm:w-3.5"
              />
            )}

          </div>

          {/* Name + Status */}

          <div className="min-w-0">

            <h2 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
              {chatDisplayName ||
                chat.name}
            </h2>

            <p className="text-xs text-green-500">
              {chat.online
                ? "Online"
                : "Offline"}
            </p>

          </div>

        </div>

        {/* Actions */}

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">

          <button
            type="button"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 sm:p-2.5"
            aria-label="Call"
          >
            <Phone size={18} />
          </button>

          <button
            type="button"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 sm:p-2.5"
            aria-label="Video call"
          >
            <Video size={19} />
          </button>

          <button
            type="button"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 sm:p-2.5"
            aria-label="More options"
          >
            <MoreVertical size={19} />
          </button>

        </div>
      </div>

      {/* Messages Area */}

      <div
        ref={messagesContainerRef}
        onScroll={
          handleMessagesScroll
        }
        className="relative z-0 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 md:p-6"
      >

        {messages.map(
          (message) => (
            <Message
              key={message.id}
              message={message}
            />
          )
        )}

      </div>

      {/* Message Input */}

      <div
        className="relative z-50 shrink-0 border-t border-gray-200 bg-white p-2.5 pointer-events-auto sm:p-3 md:p-4"
      >
        <MessageInput
          onSend={onSend}
        />
      </div>

    </div>
  );
}

export default ChatWindow;