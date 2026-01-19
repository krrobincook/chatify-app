import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    // 1. Prepare Data
    const formData = new FormData();
    formData.append("text", messageData.text);
    if (messageData.image) {
      // If it's a File object, append it. If it's base64 (edge case), append it too (backend might need handling, but Multer expects File)
      formData.append("image", messageData.image);
    }

    // 2. Generate Preview for Optimistic UI
    let imagePreview = null;
    if (messageData.image) {
      if (messageData.image instanceof File || messageData.image instanceof Blob) {
        imagePreview = URL.createObjectURL(messageData.image);
      } else if (typeof messageData.image === "string") {
        imagePreview = messageData.image; // Fallback for base64 string
      }
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: imagePreview,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 3. Optimistic Update
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData, // Send FormData!
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // 4. Success
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? res.data : msg
        ),
      }));
    } catch (error) {
      // 5. Failure
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled } = get();
      if (!selectedUser) return;

      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set((state) => {
        if (state.messages.some((m) => m._id === newMessage._id)) {
          return state;
        }
        return { messages: [...state.messages, newMessage] };
      });

      if (isSoundEnabled) {
        try {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        } catch (err) {
          console.log("Sound error", err);
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
}));