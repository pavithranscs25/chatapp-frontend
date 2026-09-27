import React, { useEffect, useState } from "react";

function Requests() {
  console.log("REQUEST PAGE RENDERED");

  const [currentUser, setCurrentUser] = useState(null);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ---------------- CURRENT USER ----------------
  useEffect(() => {
    fetch("https://chatapp-backend-zemv.onrender.com/api/users/me", {
      credentials: "include",
    })
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

    fetch("https://chatapp-backend-zemv.onrender.com/api/users", {
      credentials: "include",
    })
      .then((response) => {
        console.log("All users API status:", response.status);

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
        console.error("Users fetch error:", error);
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
          throw new Error("Failed to fetch incoming requests");
        }

        return response.json();
      })
      .then(async (data) => {
        console.log("Incoming requests:", data);

        const requestsWithNames = await Promise.all(
          data.map(async (request) => {
            const response = await fetch(
              `https://chatapp-backend-zemv.onrender.com/api/users/${request.senderId}`,
              {
                credentials: "include",
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch sender");
            }

            const user = await response.json();

            return {
              ...request,
              senderName: user.username,
              senderEmail: user.email,
            };
          })
        );

        setIncomingRequests(requestsWithNames);
      })
      .catch((error) => {
        console.error("Incoming requests error:", error);
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
          throw new Error("Failed to fetch sent requests");
        }

        return response.json();
      })
      .then(async (data) => {
        console.log("Sent requests:", data);

        const requestsWithNames = await Promise.all(
          data.map(async (request) => {
            const response = await fetch(
              `https://chatapp-backend-zemv.onrender.com/api/users/${request.receiverId}`,
              {
                credentials: "include",
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch receiver");
            }

            const user = await response.json();

            return {
              ...request,
              receiverName: user.username,
              receiverEmail: user.email,
            };
          })
        );

        setSentRequests(requestsWithNames);
      })
      .catch((error) => {
        console.error("Sent requests error:", error);
      });
  }, [currentUser]);

  // ---------------- SEND FRIEND REQUEST ----------------
  const handleSendRequest = async (receiverId) => {
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
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send request");
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
        throw new Error("Failed to refresh sent requests");
      }

      const sentData = await sentResponse.json();

      const requestsWithNames = await Promise.all(
        sentData.map(async (request) => {
          const userResponse = await fetch(
            `https://chatapp-backend-zemv.onrender.com/api/users/${request.receiverId}`,
            {
              credentials: "include",
            }
          );

          if (!userResponse.ok) {
            throw new Error("Failed to fetch receiver");
          }

          const user = await userResponse.json();

          return {
            ...request,
            receiverName: user.username,
            receiverEmail: user.email,
          };
        })
      );

      setSentRequests(requestsWithNames);
    } catch (error) {
      console.error("Send request error:", error);
      alert(error.message);
    }
  };

  // ---------------- ACCEPT / REJECT ----------------
  const handleRequest = async (requestId, status) => {
    try {
      const response = await fetch(
        `https://chatapp-backend-zemv.onrender.com/api/friend-requests/${requestId}?status=${status}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update friend request");
      }

      // Remove the request from incoming list
      setIncomingRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );

      if (status === "ACCEPTED") {
        alert("Friend request accepted!");
      } else {
        alert("Friend request rejected!");
      }
    } catch (error) {
      console.error("Request update error:", error);
      alert(error.message);
    }
  };

  // ---------------- SEARCH USERS ----------------
  const filteredUsers = users
    .filter((user) => user.id !== currentUser?.id)
    .filter((user) => {
      const searchText = search.toLowerCase().trim();

      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const name = user.name?.toLowerCase() || "";

      return (
        username.includes(searchText) ||
        email.includes(searchText) ||
        name.includes(searchText)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Friend Requests
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Find users and manage your friend requests
          </p>
        </div>

        {/* FIND USERS */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Find Friends
          </h2>

          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200
            text-gray-900 placeholder-gray-400
            rounded-xl py-2.5 px-4
            outline-none focus:border-blue-500
            focus:bg-white transition mb-4"
          />

          <div className="space-y-3">
            {search && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between
                  p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full bg-blue-600
                      text-white flex items-center justify-center
                      font-semibold"
                    >
                      {(
                        user.username ||
                        user.name ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* User details */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.username || user.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="px-4 py-2 bg-blue-600
                    text-white rounded-lg text-sm
                    hover:bg-blue-700 transition"
                  >
                    Send Request
                  </button>
                </div>
              ))
            ) : (
              search && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No users found
                </p>
              )
            )}
          </div>
        </section>

        {/* INCOMING REQUESTS */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incoming Requests
          </h2>

          {incomingRequests.length > 0 ? (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between
                  p-4 border border-gray-200 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.senderName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {request.senderEmail}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      wants to be your friend
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleRequest(request.id, "ACCEPTED")
                      }
                      className="px-4 py-2 bg-blue-600
                      text-white rounded-lg text-sm
                      hover:bg-blue-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleRequest(request.id, "REJECTED")
                      }
                      className="px-4 py-2 bg-gray-100
                      text-gray-700 rounded-lg text-sm
                      hover:bg-gray-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No incoming requests
            </p>
          )}
        </section>

        {/* SENT REQUESTS */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sent Requests
          </h2>

          {sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between
                  p-4 border border-gray-200 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.receiverName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {request.receiverEmail}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Request sent
                    </p>
                  </div>

                  <span className="text-sm text-yellow-600 font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No sent requests
            </p>
          )}
        </section>

      </div>
    </div>
  );
}

export default Requests;