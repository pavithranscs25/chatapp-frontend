import React from "react";

function Message({ message }) {
  const isMine = message.sender === "me";

  return (
    <div
      className={`mb-3 flex w-full sm:mb-4 ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`min-w-0 max-w-[85%]
        px-3 py-2.5
        backdrop-blur-md
        shadow-md
        sm:max-w-[70%]
        sm:px-4 sm:py-3
        ${
          isMine
            ? `
              rounded-2xl
              rounded-br-md
              border border-white/15
              bg-black/70
              text-white
              shadow-black/20
            `
            : `
              rounded-2xl
              rounded-bl-md
              border border-indigo-200/70
              bg-indigo-50/80
              text-gray-900
              shadow-indigo-100/40
            `
        }`}
      >
        {/* Message Text */}

        <p className="break-words text-sm leading-5">
          {message.text}
        </p>

        {/* Time */}

        <p
          className={`mt-1 text-[10px] ${
            isMine
              ? "text-right text-white/60"
              : "text-gray-400"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

export default Message;