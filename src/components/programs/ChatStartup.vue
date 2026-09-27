<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, computed, nextTick, type ComputedRef } from "vue"
import FinderItem from "@/components/ui/finder/FinderItem.vue"
import { useMenuBarStore } from "@/stores/menuBarStore"
import type { MenuEntry, WindowShallowData } from "@/types"
import pb from "@/lib/pocketbase"

const appId = inject<ComputedRef<string | undefined>>("appId")
  const openWindow = inject<(data: WindowShallowData) => void>("openWindow")
const { registerMenus } = useMenuBarStore();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function getChatMenus(): MenuEntry[] {
  return [
    {
      id: "chat",
      name: "Chat",
      labelType: "text",
      isOpen: false,
      options: [{ id: "about-chat", name: "About Chat", disabled: false }],
    },
  ];
}

onMounted(() => {
  if (appId?.value) {
    registerMenus(appId.value, getChatMenus());
  }
})

const nickname = ref("");

function getSessionId() {
  const storageKey = "chat-session-id";
  let id = sessionStorage.getItem(storageKey);

  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(storageKey, id);
  }

  return id;
}

const onEnterChat = () => {
  if (!nickname.value || nickname.value.trim() === "") {
    alert("Please enter a nickname before entering the chat.");
    return;
  }

  // Check if nickname in use, if so, alert user and return -- unless the sessionId matches, then allow them in, and the chat component will skip presence registration and just fetch messages.


  openWindow?.({
    content: "Chat",
    unifiedBackground: true,
    title: "Chat",
    height: 360,
    width: 480,
    programData: {
      nickname: nickname.value,
      sessionId: getSessionId(),
    },
  });

  emit("close");
}

</script>

<template>
  <div class="w-full h-full flex flex-col items-center font-mono px-2 gap-2 pt-10">
    <p class="w-full text-center">Welcome to my flimsy insecure chat room!</p>
    <p class="w-full text-center mt-8">Pick a nickname:</p>
    <input v-model="nickname" placeholder="Nickname" class="w-full h-9.5 rounded-sm border bg-white px-2 py-1" @keyup.enter="onEnterChat" />
    <button class="px-3 py-1 bg-blue-400 text-white rounded-md" @click="onEnterChat">Enter</button>
  </div>
</template>
