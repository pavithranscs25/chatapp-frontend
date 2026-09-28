import React, { useEffect, useRef, useState } from "react";
import { Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const STORAGE_KEY = "chatapp-frequent-emojis";

const DEFAULT_FREQUENT_EMOJIS = [
  "😀",
  "😂",
  "👍",
  "😊",
  "🔥",
];

function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [frequentEmojis, setFrequentEmojis] = useState(() => {
    try {
      const savedEmojis =
        localStorage.getItem(STORAGE_KEY);

      if (savedEmojis) {
        const parsedEmojis = JSON.parse(savedEmojis);

        if (Array.isArray(parsedEmojis)) {
          return parsedEmojis;
        }
      }
    } catch (error) {
      console.error(
        "Failed to load frequent emojis:",
        error
      );
    }

    return DEFAULT_FREQUENT_EMOJIS;
  });

  const emojiWrapperRef = useRef(null);

  // ---------------- SAVE FREQUENT EMOJIS ----------------

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(frequentEmojis)
      );
    } catch (error) {
      console.error(
        "Failed to save frequent emojis:",
        error
      );
    }
  }, [frequentEmojis]);

  // ---------------- CLOSE OUTSIDE ----------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiWrapperRef.current &&
        !emojiWrapperRef.current.contains(
          event.target
        )
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ---------------- ADD FREQUENT ----------------

  const addToFrequent = (emoji) => {
    setFrequentEmojis((previousEmojis) => {
      const filteredEmojis =
        previousEmojis.filter(
          (item) => item !== emoji
        );

      return [
        emoji,
        ...filteredEmojis,
      ].slice(0, 12);
    });
  };

  // ---------------- REMOVE FREQUENT ----------------

  const removeFromFrequent = (
    emoji,
    event
  ) => {
    event.stopPropagation();

    setFrequentEmojis(
      (previousEmojis) =>
        previousEmojis.filter(
          (item) => item !== emoji
        )
    );
  };

  // ---------------- EMOJI CLICK ----------------

  const handleEmojiClick = (emojiData) => {
    setText(
      (previousText) =>
        previousText + emojiData.emoji
    );

    addToFrequent(
      emojiData.emoji
    );
  };

  // ---------------- FREQUENT EMOJI CLICK ----------------

  const handleFrequentEmojiClick = (
    emoji
  ) => {
    setText(
      (previousText) =>
        previousText + emoji
    );

    addToFrequent(emoji);
  };

  // ---------------- SEND ----------------

  const handleSend = () => {
    if (text.trim() === "") {
      return;
    }

    onSend(text);

    setText("");

    setShowEmojiPicker(false);
  };

  // ---------------- ENTER ----------------

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleSend();
    }
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">

      {/* Emoji Button + Picker */}

      <div
        ref={emojiWrapperRef}
        className="relative shrink-0"
      >
        <button
          type="button"
          onClick={() =>
            setShowEmojiPicker(
              (previous) =>
                !previous
            )
          }
          className="flex h-10 w-10
          items-center justify-center
          rounded-full text-gray-500
          transition hover:bg-gray-100
          sm:h-11 sm:w-11"
          aria-label="Emoji"
        >
          <Smile size={21} />
        </button>

        {/* Emoji Popup */}

        {showEmojiPicker && (
          <div
            className="absolute bottom-14 left-0
            z-[9999] flex w-[320px]
            max-w-[calc(100vw-24px)]
            flex-col overflow-hidden
            rounded-2xl border border-gray-200
            bg-white shadow-2xl sm:w-[350px]"
          >

            {/* Frequently Used */}

            <div className="border-b border-gray-100 px-3 py-3">

              <div className="mb-2 flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Frequently Used
                </p>

              </div>

              {frequentEmojis.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">

                  {frequentEmojis.map(
                    (emoji, index) => (
                      <div
                        key={`${emoji}-${index}`}
                        className="group relative"
                      >

                        {/* Emoji */}

                        <button
                          type="button"
                          onClick={() =>
                            handleFrequentEmojiClick(
                              emoji
                            )
                          }
                          className="flex h-9 w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-xl
                          transition
                          hover:bg-gray-100"
                          aria-label={`Use ${emoji}`}
                        >
                          {emoji}
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={(event) =>
                            removeFromFrequent(
                              emoji,
                              event
                            )
                          }
                          className="absolute -right-1
                          -top-1 hidden h-4 w-4
                          items-center justify-center
                          rounded-full
                          border border-gray-200
                          bg-white
                          text-gray-400
                          shadow-sm
                          group-hover:flex
                          hover:bg-red-50
                          hover:text-red-500"
                          aria-label={`Remove ${emoji}`}
                        >
                          <X size={10} />
                        </button>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="py-2 text-xs text-gray-400">
                  No frequently used emojis
                </p>
              )}

            </div>

            {/* Official Emoji Picker */}

            <div className="overflow-hidden">

              <EmojiPicker
                onEmojiClick={
                  handleEmojiClick
                }
                width="100%"
                height={400}
                previewConfig={{
                  showPreview: false,
                }}
                searchDisabled={false}
                skinTonesDisabled={false}

                /*
                 * Hide the package's own Suggested /
                 * Frequently Used category.
                 * We use our custom removable section above.
                 */
                categories={[
                  "smileys_people",
                  "animals_nature",
                  "food_drink",
                  "travel_places",
                  "activities",
                  "objects",
                  "symbols",
                  "flags",
                ]}
              />

            </div>

          </div>
        )}
      </div>

      {/* Message Input */}

      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="min-w-0 flex-1
        rounded-xl
        border border-gray-200
        bg-gray-100
        px-3 py-2.5
        text-sm text-gray-900
        outline-none transition
        placeholder:text-gray-400
        focus:border-blue-500
        focus:bg-white
        sm:px-4 sm:py-3
        sm:text-base"
      />

      {/* Send Button */}

      <button
        type="button"
        onClick={handleSend}
        className="flex h-10 w-10
        shrink-0 items-center
        justify-center rounded-xl
        bg-blue-600
        text-white transition
        hover:bg-blue-700
        sm:h-11 sm:w-11"
        aria-label="Send message"
      >
        <Send size={19} />
      </button>

    </div>
  );
}

export default MessageInput;