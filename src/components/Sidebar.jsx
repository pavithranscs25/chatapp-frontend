import React, {
  useEffect,
  useState,
} from "react";
import {
  Search,
  MoreVertical,
} from "lucide-react";
import ChatList from "./ChatList";
import { useNavigate } from "react-router-dom";

function Sidebar({
  chats,
  selectedChat,
  setSelectedChat,
  currentUser,
  handleLogout,
  unreadCounts
}) {
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const [customNames, setCustomNames] =
    useState({});

  const navigate = useNavigate();

  // ---------------- CUSTOM NAME STORAGE KEY ----------------

  const customNamesKey = currentUser?.id
    ? `chatapp-custom-names-${currentUser.id}`
    : null;

  // ---------------- LOAD CUSTOM NAMES ----------------

  useEffect(() => {
    if (!customNamesKey) {
      return;
    }

    try {
      const savedNames =
        localStorage.getItem(
          customNamesKey
        );

      if (savedNames) {
        const parsedNames =
          JSON.parse(savedNames);

        if (
          parsedNames &&
          typeof parsedNames === "object"
        ) {
          setCustomNames(
            parsedNames
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load custom names:",
        error
      );
    }
  }, [customNamesKey]);

  // ---------------- SAVE CUSTOM NAME ----------------

  const handleSaveCustomName = (
    chatId,
    customName
  ) => {
    setCustomNames((previousNames) => {
      const updatedNames = {
        ...previousNames,
        [chatId]: customName,
      };

      if (customNamesKey) {
        try {
          localStorage.setItem(
            customNamesKey,
            JSON.stringify(
              updatedNames
            )
          );
        } catch (error) {
          console.error(
            "Failed to save custom name:",
            error
          );
        }
      }

      return updatedNames;
    });
  };

  // ---------------- SEARCH ----------------

  const filteredChats =
    chats.filter((chat) => {
      const originalName =
        chat.name?.toLowerCase() || "";

      const customName =
        customNames[chat.id]
          ?.toLowerCase() || "";

      const searchText =
        search.toLowerCase();

      return (
        originalName.includes(
          searchText
        ) ||
        customName.includes(
          searchText
        )
      );
    });

  // ---------------- UI ----------------

  return (
    <div className="flex h-full w-full min-w-0 flex-col border-r border-gray-200 bg-white">

      {/* Header */}

      <div className="shrink-0 border-b border-gray-200 p-4 sm:p-5">

        <div className="mb-4 flex items-center justify-between sm:mb-5">

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Chat<span className="text-blue-600">
              App
            </span>
          </h1>

          {/* Three Dot Menu */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowMenu(
                  (previous) =>
                    !previous
                )
              }
              className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
              aria-label="Open menu"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">

                {/* Requests */}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(
                      "/requests"
                    );
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  Requests
                </button>

                {/* Settings */}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(
                      "/settings"
                    );
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  Settings
                </button>

                {/* Logout */}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Current User */}

        {currentUser && (
          <div className="mb-4 flex min-w-0 items-center gap-3">

            <img
              src={currentUser.picture}
              alt="Profile"
              className="h-10 w-10 shrink-0 rounded-full"
            />

            <div className="min-w-0">

              <p className="truncate font-semibold text-gray-900">
                {currentUser.name}
              </p>

            </div>

          </div>
        )}

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
          />

        </div>

      </div>

      {/* Chat List */}

      <ChatList
        chats={filteredChats}
        selectedChat={selectedChat}
        setSelectedChat={
          setSelectedChat
        }
        customNames={customNames}
        onSaveCustomName={
          handleSaveCustomName
        }
        unreadCounts={unreadCounts}
      />

    </div>
  );
}

export default Sidebar;