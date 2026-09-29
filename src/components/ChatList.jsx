import React, { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";

function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  customNames,
  onSaveCustomName,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editName, setEditName] = useState("");

  // ---------------- START EDIT ----------------

  const handleStartEdit = (chat) => {
    const currentName =
      customNames[chat.id] || chat.name;

    setEditingChatId(chat.id);
    setEditName(currentName);
    setOpenMenuId(null);
  };

  // ---------------- SAVE EDIT ----------------

  const handleSaveEdit = (chatId) => {
    const trimmedName = editName.trim();

    if (trimmedName === "") {
      return;
    }

    onSaveCustomName(
      chatId,
      trimmedName
    );

    setEditingChatId(null);
    setEditName("");
  };

  // ---------------- CANCEL EDIT ----------------

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditName("");
  };

  // ---------------- UI ----------------

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">

      {chats.length > 0 ? (

        chats.map((chat, index) => {
          const displayName =
            customNames[chat.id] ||
            chat.name;

          const isEditing =
            editingChatId === chat.id;

          const isMenuOpen =
            openMenuId === chat.id;

          return (
            <div
              key={chat.id}
              onClick={() => {
                if (!isEditing) {
                  setSelectedChat(index);
                  setOpenMenuId(null);
                }
              }}
              className={`group relative flex cursor-pointer items-center gap-3 border-b border-gray-100 p-3 transition sm:p-4
              ${
                selectedChat === index
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >

              {/* Avatar */}

              <div className="relative shrink-0">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white sm:h-12 sm:w-12">
                  {displayName
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>

                {chat.online && (
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 sm:h-3.5 sm:w-3.5"
                  />
                )}

              </div>

              {/* Chat Information */}

              <div className="min-w-0 flex-1">

                {isEditing ? (

                  /* Edit Name */

                  <div
                    className="pr-2"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >

                    <input
                      type="text"
                      value={editName}
                      autoFocus
                      onChange={(e) =>
                        setEditName(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          handleSaveEdit(
                            chat.id
                          );
                        }

                        if (
                          e.key ===
                          "Escape"
                        ) {
                          handleCancelEdit();
                        }
                      }}
                      className="w-full rounded-lg border border-blue-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-1.5 flex items-center gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveEdit(
                            chat.id
                          )
                        }
                        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        <Check size={13} />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleCancelEdit
                        }
                        className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
                      >
                        <X size={13} />
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>
                    <div className="flex items-center justify-between gap-2">

                      <h3 className="truncate font-semibold text-gray-900">
                        {displayName}
                      </h3>

                      <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
                        {chat.time}
                      </span>

                    </div>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {chat.message}
                    </p>
                  </>
                )}

              </div>

              {/* Three Dot Menu */}

              {!isEditing && (
                <div
                  className="relative shrink-0"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        isMenuOpen
                          ? null
                          : chat.id
                      )
                    }
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Chat options"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Menu */}

                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">

                      <button
                        type="button"
                        onClick={() =>
                          handleStartEdit(
                            chat
                          )
                        }
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        <Pencil size={15} />
                        Edit Name
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })

      ) : (

        <p className="mt-10 px-4 text-center text-gray-400">
          No chats found
        </p>

      )}

    </div>
  );
}

export default ChatList;