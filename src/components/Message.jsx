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
        className={`min-w-0 max-w-[85%] px-3 py-2.5 sm:max-w-[70%] sm:px-4 sm:py-3 ${
          isMine
            ? "rounded-2xl rounded-br-md bg-blue-600 text-white"
            : "rounded-2xl rounded-bl-md border border-gray-200 bg-white text-gray-900"
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
              ? "text-right text-blue-100"
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