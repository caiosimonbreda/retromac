<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed, nextTick, type ComputedRef } from "vue"
import FinderItem from "@/components/ui/finder/FinderItem.vue"
import { useMenuBarStore } from "@/stores/menuBarStore"
import type { MenuEntry, WindowShallowData } from "@/types"
import pb from "@/lib/pocketbase"

const appId = inject<ComputedRef<string | undefined>>("appId")
const { registerMenus } = useMenuBarStore();

function getFinderMenus(): MenuEntry[] {
  return [
    {
      id: "chat",
      name: "Chat",
      labelType: "text",
      isOpen: false,
      options: [{ id: "about-chat", name: "About Chat", disabled: false }],
    },
    {
      id: "file",
      name: "File",
      labelType: "text",
      isOpen: false,
      options: [
        {
          id: "new-finder-window",
          name: "New Finder Window",
          disabled: false,
          openWindow: {
            title: "Finder",
            content: "Finder",
            offsetX: 40,
            offsetY: 60,
            initialX: 0,
            initialY: 0,
            height: 360,
            width: 460,
            isMaximized: false,
            unifiedBackground: true,
          },
        },
        { id: "open", name: "Open", disabled: true },
        { id: "save", name: "Save", disabled: true },
        { id: "save-as", name: "Save As", disabled: true },
        { id: "close", name: "Close", disabled: true },
      ],
    },
    {
      id: "edit",
      name: "Edit",
      labelType: "text",
      isOpen: false,
      options: [{ id: "cut", name: "Cut", disabled: false }],
    },
    {
      id: "view",
      name: "View",
      labelType: "text",
      isOpen: false,
      options: [
        { id: "zoom-in", name: "Zoom In", disabled: false },
        { id: "zoom-out", name: "Zoom Out", disabled: false },
      ],
    },
    {
      id: "go",
      name: "Go",
      labelType: "text",
      isOpen: false,
      options: [{ id: "go-to-folder", name: "Go to Folder", disabled: false }],
    },
    {
      id: "help",
      name: "Help",
      labelType: "text",
      isOpen: false,
      options: [{ id: "help", name: "Help", disabled: false }],
    },
  ];
}

const openWindow = inject<(data: WindowShallowData) => void>("openWindow")

// Message receiving:
const messages = ref([]); 
const peoplePresent = ref([]); // This will hold the list of people currently present in the chat
const chatContainer = ref<HTMLDivElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();

  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

let messageUnsubscribe;
let presenceUnsubscribe;

const nickname = ref("caio");
// const nickname = ref(localStorage.getItem("chat-nickname") ?? "");

onMounted(async () => {
  if (appId?.value) {
    registerMenus(appId.value, getFinderMenus())
  }

  // Chat history retrieval
  const result = await pb.collection("chatMessages").getList(1, 50, {
    sort: "created",
  });

  messages.value = result.items;
  await scrollToBottom();

  // Chat message subscription
  messageUnsubscribe = await pb.collection("chatMessages").subscribe("*", (event) => {
    const record = event.record;

    if (event.action === "create") {
      if (!messages.value.some((message) => message.id === record.id)) {
        messages.value.push(record);
        messages.value.sort((a, b) =>
          a.created.localeCompare(b.created),
        );
        void scrollToBottom();
      }
    } else if (event.action === "update") {
      const index = messages.value.findIndex(
        (message) => message.id === record.id,
      );
      if (index !== -1) messages.value[index] = record;
    } else if (event.action === "delete") {
      messages.value = messages.value.filter(
        (message) => message.id !== record.id,
      );
    }
  });

  const presenceResult = await pb.collection("chatPresence").getFullList({
    sort: "created",
  });

  peoplePresent.value = presenceResult;

  presenceUnsubscribe = await pb.collection("chatPresence").subscribe("*", (event) => {
    // Handle presence events
    if (event.action === "create") {
      if (!peoplePresent.value.some((person) => person.id === event.record.id)) {
        peoplePresent.value.push(event.record);
      }
    } else if (event.action === "delete") {
      peoplePresent.value = peoplePresent.value.filter(
        (person) => person.id !== event.record.id,
      );
    }
  });

  // Declare presence
  await pb.collection("chatPresence").create({
    nickname: nickname.value,
  });

  // Notify that the user has joined the chat
  await pb.collection("chatMessages").create({
    nickname: 'systemctl',
    content: `${nickname.value} has joined the chat.`,
  });
})

onUnmounted(async () => {
  await pb.collection("chatMessages").create({
    nickname: 'systemctl',
    content: `${nickname.value} has fled.`,
  });

  await pb.collection("chatPresence").delete(peoplePresent.value.find(person => person.nickname === nickname.value)?.id);

  messageUnsubscribe?.();
  presenceUnsubscribe?.();
});

// Message sending:
const messageInput = ref("")

const sendMessage = async () => {
  if (!messageInput.value.trim()) return;

  await pb.collection("chatMessages").create({
    nickname: nickname.value,
    content: messageInput.value,
  });

  messageInput.value = "";
}

</script>

<template>
  <div class="w-full h-full flex font-mono px-2 gap-2">
    <div class="w-48 h-full rounded-md text-sm">
      <div class="flex flex-col w-full h-full bg-white border overflow-y-auto rounded-md gap-1 px-2 py-1">
        <p>People:</p>
        <p v-for="person in peoplePresent" :key="person.id" :class="`${person.nickname === nickname ? 'text-red-500' : 'text-blue-500'}`">
          {{ person.nickname }}
        </p>
      </div>
    </div>
    <div class="flex flex-col w-full h-full gap-2">
      <div ref="chatContainer" id="chat-container" class="flex flex-col gap-1 px-2 py-1 h-full bg-white border rounded-md overflow-y-auto">
        <div v-for="message in messages" :key="message.id">
          <p v-if="message.nickname !== 'systemctl'" class="text-black leading-5.5">
            <span :class="`${message.nickname === nickname ? 'text-red-500' : 'text-blue-500'}`">
              {{ message.nickname }}
              {{ '[' + new Date(message.created).toLocaleString().slice(12, 17) + ']' }}:</span>
            <span class="ml-2">{{ message.content }}</span>
          </p>
          <p v-else class="text-black/40 text-sm leading-5.5">
            <span class="ml-2">{{ message.content }}</span>
          </p>
        </div>
      </div>
      <div id="message-input-container" class="flex h-9.5 rounded-md">
        <textarea class="w-full h-full p-2 rounded-md border bg-white resize-none text-sm"
          placeholder="Type a message..." v-model="messageInput" @keypress.enter="sendMessage" />
        <button class="ml-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 active:bg-blue-300 text-sm"
          @click="sendMessage">
          Send
        </button>
      </div>
    </div>
  </div>
</template>
