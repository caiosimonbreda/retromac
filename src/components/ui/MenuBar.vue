<script setup lang="ts">
import { reactive, ref } from "vue";
import { useEventListener, unrefElement } from "@vueuse/core";
import RaphaelApple from "@/icons/RaphaelApple.vue";

const menuBarRef = ref<HTMLElement | null>(null);

const menuItems = reactive([
  {
    name: "File",
    isOpen: false,
    options: [
      {
        id: "new",
        name: "New",
        disabled: false,
      },
      {
        id: "open",
        name: "Open",
        disabled: false,
      },
      {
        id: "save",
        name: "Save",
        disabled: true,
      },
      {
        id: "save-as",
        name: "Save As",
        disabled: true,
      },
      {
        id: "close",
        name: "Close",
        disabled: false,
      },
    ],
  },
  {
    name: "Edit",
    isOpen: false,
    options: [
      {
        id: "cut",
        name: "Cut",
        disabled: false,
      },
    ],
  },
  {
    name: "View",
    isOpen: false,
    options: [
      {
        id: "zoom-in",
        name: "Zoom In",
        disabled: false,
      },
      {
        id: "zoom-out",
        name: "Zoom Out",
        disabled: false,
      },
    ],
  },
  {
    name: "Go",
    isOpen: false,
    options: [
      {
        id: "go-to-folder",
        name: "Go to Folder",
        disabled: false,
      },
    ],
  },
  {
    name: "Help",
    isOpen: false,
    options: [
      {
        id: "help",
        name: "Help",
        disabled: false,
      },
    ],
  },
]);

const toggleMenu = (clickedItem: (typeof menuItems)[number]) => {
  const wasOpen = clickedItem.isOpen;
  menuItems.forEach((item) => (item.isOpen = false));
  if (!wasOpen) {
    clickedItem.isOpen = true;
  }
};

const onMenuHover = (hoveredItem: (typeof menuItems)[number]) => {
  const anyOpen = menuItems.some((item) => item.isOpen);
  if (anyOpen) {
    menuItems.forEach((item) => (item.isOpen = false));
    hoveredItem.isOpen = true;
  }
};

useEventListener(document, "mousedown", (e) => {
  const el = unrefElement(menuBarRef);
  if (el && !el.contains(e.target as Node)) {
    if (menuItems.some((item) => item.isOpen)) {
      menuItems.forEach((item) => (item.isOpen = false));
    }
  }
});
</script>

<template>
  <div
    ref="menuBarRef"
    class="relative flex flex-row items-center bg-slate-100 font-mono border-b px-3.5 h-7 border-b-black font-light"
  >
    <RaphaelApple class="font-black h-full w-5 mr-2" />
    <span class="font-bold px-2">Finder</span>
    <div
      v-for="item in menuItems"
      :key="item.name"
      class="relative h-full px-2"
      :class="item.isOpen ? 'bg-blue-400 text-white' : 'text-black'"
      @mouseenter="onMenuHover(item)"
    >
      <span @click="toggleMenu(item)">{{ item.name }}</span>
      <div
        v-if="item.isOpen"
        class="absolute flex flex-col shrink-0 outline left-0 top-[26px] bg-slate-200 text-black tracking-tight z-9999"
      >
        <button
          v-for="option in item.options"
          :key="option.id"
          :disabled="option.disabled"
          class="flex items-center gap-2 px-3 py-1 hover:bg-blue-400 hover:text-white text-nowrap disabled:text-gray-400 disabled:hover:bg-transparent"
        >
          <span>{{ option.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
