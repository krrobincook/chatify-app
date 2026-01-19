import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessageLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return() => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // If no user selected yet
  if (!selectedUser) {
    return (
      <>
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select a chat to start messaging
        </div>
      </>
    );
  }

  return (
    <>
      <ChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isSender = msg.senderId?.toString() === authUser._id?.toString();

              return (
                <div
                  key={msg._id}
                  className={`chat ${isSender ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative ${
                      isSender
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg h-48 object-cover mb-2"
                      />
                    )}

                    {msg.text && <p>{msg.text}</p>}

                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
