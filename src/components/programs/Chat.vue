<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed, type ComputedRef } from "vue"
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

const nickname = ref("caio");
// const nickname = ref(localStorage.getItem("chat-nickname") ?? "");

onMounted(async () => {
  if (appId?.value) {
    registerMenus(appId.value, getFinderMenus())
  }

  // Chat message subscription
  const result = await pb.collection("chatMessages").getList(1, 50, {
    sort: "created",
  });

  // console.log("Fetched chat messages:", result.items);
  messages.value = result.items;

  unsubscribe = await pb.collection("chatMessages").subscribe("*", (event) => {
    const record = event.record;

    if (event.action === "create") {
      if (!messages.value.some((message) => message.id === record.id)) {
        messages.value.push(record);
        messages.value.sort((a, b) =>
          a.created.localeCompare(b.created),
        );
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
})

const openWindow = inject<(data: WindowShallowData) => void>("openWindow")

// Message sending:
const messageInput = ref("")


// Message receiving:
const messages = ref([]);

let unsubscribe;

onUnmounted(() => {
  unsubscribe?.();
});

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
      <div class="flex w-full h-full bg-white border rounded-md"></div>
    </div>
    <div class="flex flex-col w-full h-full gap-2">
      <div id="chat-container" class="flex flex-col gap-1 px-2 py-1 h-full bg-white border rounded-md">
        <p v-for="message in messages" :key="message.id" class="text-black leading-5.5">
          <span :class="`${message.nickname === nickname ? 'text-blue-500' : 'text-gray-500'}`">
            {{ message.nickname }}
            {{ '[' + new Date(message.created).toLocaleString().slice(12, 17) + ']' }}:</span>
          <span class="ml-2">{{ message.content }}</span>
        </p>
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