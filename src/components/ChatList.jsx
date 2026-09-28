import React from "react";

function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">

      {chats.length > 0 ? (

        chats.map((chat, index) => (

          <div
            key={chat.id}
            onClick={() =>
              setSelectedChat(index)
            }
            className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 p-3 transition sm:p-4
            ${
              selectedChat === index
                ? "bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >

            {/* Avatar */}

            <div className="relative shrink-0">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white sm:h-12 sm:w-12">
                {chat.avatar}
              </div>

              {chat.online && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 sm:h-3.5 sm:w-3.5"
                />
              )}

            </div>

            {/* Chat Information */}

            <div className="min-w-0 flex-1">

              <div className="flex items-center justify-between gap-2">

                <h3 className="truncate font-semibold text-gray-900">
                  {chat.name}
                </h3>

                <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
                  {chat.time}
                </span>

              </div>

              <p className="mt-1 truncate text-sm text-gray-500">
                {chat.message}
              </p>

            </div>

          </div>

        ))

      ) : (

        <p className="mt-10 px-4 text-center text-gray-400">
          No chats found
        </p>

      )}

    </div>
  );
}

export default ChatList;