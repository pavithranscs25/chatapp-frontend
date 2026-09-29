import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Volume2,
  Moon,
  CircleUserRound,
  Shield,
  MessageCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  // ---------------- LOAD SETTINGS ----------------

  useEffect(() => {
    const savedSettings =
      localStorage.getItem("chatapp-settings");

    if (!savedSettings) {
      return;
    }

    try {
      const settings = JSON.parse(savedSettings);

      setNotifications(
        settings.notifications ?? true
      );

      setSound(
        settings.sound ?? true
      );

      setDarkMode(
        settings.darkMode ?? false
      );

      setOnlineStatus(
        settings.onlineStatus ?? true
      );
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    }
  }, []);

  // ---------------- SAVE SETTINGS ----------------

  useEffect(() => {
    const settings = {
      notifications,
      sound,
      darkMode,
      onlineStatus,
    };

    localStorage.setItem(
      "chatapp-settings",
      JSON.stringify(settings)
    );
  }, [
    notifications,
    sound,
    darkMode,
    onlineStatus,
  ]);

  // ---------------- TOGGLE COMPONENT ----------------

  const Toggle = ({
    enabled,
    onClick,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-gray-300"
        }`}
        aria-label="Toggle setting"
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 text-gray-900">

      {/* Header */}

      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">

        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 sm:h-20 sm:px-6">

          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
            aria-label="Back to chat"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Settings
            </h1>

            <p className="text-xs text-gray-500 sm:text-sm">
              Customize your ChatApp experience
            </p>
          </div>

        </div>

      </div>

      {/* Main Content */}

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Account Section */}

        <section className="mb-6">

          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Account
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <button
              type="button"
              className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-gray-50 sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CircleUserRound size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Profile
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Manage your profile information
                </p>
              </div>

              <span className="text-gray-400">
                →
              </span>
            </button>

          </div>

        </section>

        {/* Preferences Section */}

        <section className="mb-6">

          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Preferences
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Notifications */}

            <div className="flex items-center gap-4 border-b border-gray-100 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Notifications
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Receive chat notifications
                </p>
              </div>

              <Toggle
                enabled={notifications}
                onClick={() =>
                  setNotifications(
                    (previous) => !previous
                  )
                }
              />

            </div>

            {/* Sound */}

            <div className="flex items-center gap-4 border-b border-gray-100 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Volume2 size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Message Sound
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Play a sound for new messages
                </p>
              </div>

              <Toggle
                enabled={sound}
                onClick={() =>
                  setSound(
                    (previous) => !previous
                  )
                }
              />

            </div>

            {/* Dark Mode */}

            <div className="flex items-center gap-4 border-b border-gray-100 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Moon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Dark Mode
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Use a darker appearance
                </p>
              </div>

              <Toggle
                enabled={darkMode}
                onClick={() =>
                  setDarkMode(
                    (previous) => !previous
                  )
                }
              />

            </div>

            {/* Online Status */}

            <div className="flex items-center gap-4 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CircleUserRound size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Online Status
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Let friends see when you're online
                </p>
              </div>

              <Toggle
                enabled={onlineStatus}
                onClick={() =>
                  setOnlineStatus(
                    (previous) => !previous
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* Privacy Section */}

        <section className="mb-6">

          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Privacy & Chat
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center gap-4 border-b border-gray-100 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Shield size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Privacy
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Your conversations are protected
                </p>
              </div>

              <Check
                size={20}
                className="text-green-500"
              />

            </div>

            <div className="flex items-center gap-4 p-4 sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircle size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  Chat Preferences
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Manage your chat experience
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Footer */}

        <div className="pb-6 pt-2 text-center">

          <p className="text-xs text-gray-400">
            ChatApp Settings
          </p>

        </div>

      </main>

    </div>
  );
}

export default Settings;