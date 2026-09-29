import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Requests() {
  console.log("REQUEST PAGE RENDERED");

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ---------------- CURRENT USER ----------------

  useEffect(() => {
    fetch(
      "https://chatapp-backend-zemv.onrender.com/api/users/me",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("User not authenticated");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Current user:", data);
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error("User fetch error:", error);
      });
  }, []);

  // ---------------- FETCH ALL USERS ----------------

  useEffect(() => {
    if (!currentUser) return;

    fetch(
      "https://chatapp-backend-zemv.onrender.com/api/users",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        console.log(
          "All users API status:",
          response.status
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        return response.json();
      })
      .then((data) => {
        console.log("All users:", data);
        setUsers(data);
      })
      .catch((error) => {
        console.error(
          "Users fetch error:",
          error
        );
      });
  }, [currentUser]);

  // ---------------- FETCH INCOMING REQUESTS ----------------

  useEffect(() => {
    if (!currentUser) return;

    fetch(
      `https://chatapp-backend-zemv.onrender.com/api/friend-requests/pending/${currentUser.id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch incoming requests"
          );
        }

        return response.json();
      })
      .then(async (data) => {
        console.log(
          "Incoming requests:",
          data
        );

        const requestsWithNames =
          await Promise.all(
            data.map(async (request) => {
              const response = await fetch(
                `https://chatapp-backend-zemv.onrender.com/api/users/${request.senderId}`,
                {
                  credentials: "include",
                }
              );

              if (!response.ok) {
                throw new Error(
                  "Failed to fetch sender"
                );
              }

              const user =
                await response.json();

              return {
                ...request,
                senderName:
                  user.username,
                senderEmail:
                  user.email,
              };
            })
          );

        setIncomingRequests(
          requestsWithNames
        );
      })
      .catch((error) => {
        console.error(
          "Incoming requests error:",
          error
        );
      });
  }, [currentUser]);

  // ---------------- FETCH SENT REQUESTS ----------------

  useEffect(() => {
    if (!currentUser) return;

    fetch(
      `https://chatapp-backend-zemv.onrender.com/api/friend-requests/sent/${currentUser.id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch sent requests"
          );
        }

        return response.json();
      })
      .then(async (data) => {
        console.log(
          "Sent requests:",
          data
        );

        const requestsWithNames =
          await Promise.all(
            data.map(async (request) => {
              const response = await fetch(
                `https://chatapp-backend-zemv.onrender.com/api/users/${request.receiverId}`,
                {
                  credentials: "include",
                }
              );

              if (!response.ok) {
                throw new Error(
                  "Failed to fetch receiver"
                );
              }

              const user =
                await response.json();

              return {
                ...request,
                receiverName:
                  user.username,
                receiverEmail:
                  user.email,
              };
            })
          );

        setSentRequests(
          requestsWithNames
        );
      })
      .catch((error) => {
        console.error(
          "Sent requests error:",
          error
        );
      });
  }, [currentUser]);

  // ---------------- SEND FRIEND REQUEST ----------------

  const handleSendRequest = async (
    receiverId
  ) => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `https://chatapp-backend-zemv.onrender.com/api/friend-requests?senderId=${currentUser.id}&receiverId=${receiverId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to send request"
        );
      }

      alert("Friend request sent!");

      // Refresh sent requests
      const sentResponse = await fetch(
        `https://chatapp-backend-zemv.onrender.com/api/friend-requests/sent/${currentUser.id}`,
        {
          credentials: "include",
        }
      );

      if (!sentResponse.ok) {
        throw new Error(
          "Failed to refresh sent requests"
        );
      }

      const sentData =
        await sentResponse.json();

      const requestsWithNames =
        await Promise.all(
          sentData.map(async (request) => {
            const userResponse =
              await fetch(
                `https://chatapp-backend-zemv.onrender.com/api/users/${request.receiverId}`,
                {
                  credentials: "include",
                }
              );

            if (!userResponse.ok) {
              throw new Error(
                "Failed to fetch receiver"
              );
            }

            const user =
              await userResponse.json();

            return {
              ...request,
              receiverName:
                user.username,
              receiverEmail:
                user.email,
            };
          })
        );

      setSentRequests(
        requestsWithNames
      );
    } catch (error) {
      console.error(
        "Send request error:",
        error
      );

      alert(error.message);
    }
  };

  // ---------------- ACCEPT / REJECT ----------------

  const handleRequest = async (
    requestId,
    status
  ) => {
    try {
      const response = await fetch(
        `https://chatapp-backend-zemv.onrender.com/api/friend-requests/${requestId}?status=${status}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update friend request"
        );
      }

      // Remove the request from incoming list
      setIncomingRequests(
        (prevRequests) =>
          prevRequests.filter(
            (request) =>
              request.id !== requestId
          )
      );

      if (status === "ACCEPTED") {
        alert(
          "Friend request accepted!"
        );
      } else {
        alert(
          "Friend request rejected!"
        );
      }
    } catch (error) {
      console.error(
        "Request update error:",
        error
      );

      alert(error.message);
    }
  };

  // ---------------- SEARCH USERS ----------------

  const filteredUsers = users
    .filter(
      (user) =>
        user.id !== currentUser?.id
    )
    .filter((user) => {
      const searchText =
        search.toLowerCase().trim();

      const username =
        user.username?.toLowerCase() ||
        "";

      const email =
        user.email?.toLowerCase() || "";

      const name =
        user.name?.toLowerCase() || "";

      return (
        username.includes(searchText) ||
        email.includes(searchText) ||
        name.includes(searchText)
      );
    });

  // ---------------- UI ----------------

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 text-gray-900">

      {/* Header */}

      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">

        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 sm:h-20 sm:px-6">

          {/* Back Button */}

          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="shrink-0 rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
            aria-label="Back to chat"
          >
            <ArrowLeft size={21} />
          </button>

          {/* Header Text */}

          <div className="min-w-0">

            <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
              Friend Requests
            </h1>

            <p className="truncate text-xs text-gray-500 sm:text-sm">
              Find users and manage your friend requests
            </p>

          </div>

        </div>

      </div>

      {/* Main Content */}

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">

        {/* FIND USERS */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Find Friends
          </h2>

          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white sm:text-base"
          />

          <div className="space-y-3">

            {search &&
            filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* User Details */}

                  <div className="flex min-w-0 items-center gap-3">

                    {/* Avatar */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                      {(
                        user.username ||
                        user.name ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Details */}

                    <div className="min-w-0">

                      <p className="truncate font-medium text-gray-900">
                        {user.username ||
                          user.name}
                      </p>

                      <p className="truncate text-sm text-gray-500">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  {/* Send Request */}

                  <button
                    type="button"
                    onClick={() =>
                      handleSendRequest(
                        user.id
                      )
                    }
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Send Request
                  </button>

                </div>
              ))
            ) : (
              search && (
                <p className="py-4 text-center text-sm text-gray-400">
                  No users found
                </p>
              )
            )}

          </div>

        </section>

        {/* INCOMING REQUESTS */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Incoming Requests
          </h2>

          {incomingRequests.length >
          0 ? (
            <div className="space-y-3">

              {incomingRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-medium text-gray-900">
                        {request.senderName}
                      </p>

                      <p className="truncate text-sm text-gray-500">
                        {request.senderEmail}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        wants to be your friend
                      </p>

                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">

                      <button
                        type="button"
                        onClick={() =>
                          handleRequest(
                            request.id,
                            "ACCEPTED"
                          )
                        }
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 sm:flex-none"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRequest(
                            request.id,
                            "REJECTED"
                          )
                        }
                        className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200 sm:flex-none"
                      >
                        Reject
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No incoming requests
            </p>
          )}

        </section>

        {/* SENT REQUESTS */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Sent Requests
          </h2>

          {sentRequests.length > 0 ? (
            <div className="space-y-3">

              {sentRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-medium text-gray-900">
                        {request.receiverName}
                      </p>

                      <p className="truncate text-sm text-gray-500">
                        {request.receiverEmail}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Request sent
                      </p>

                    </div>

                    <span className="self-start rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-600 sm:self-auto">
                      Pending
                    </span>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No sent requests
            </p>
          )}

        </section>

      </main>

    </div>
  );
}

export default Requests;