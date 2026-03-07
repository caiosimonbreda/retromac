<script setup lang="ts">
import { reactive, ref } from "vue";
import { useEventListener, unrefElement } from "@vueuse/core";
import RaphaelApple from "@/icons/RaphaelApple.vue";
import type { WindowShallowData } from "@/types";

type MenuOption = {
  id: string;
  name: string;
  disabled: boolean;
  openWindow?: WindowShallowData;
};
type MenuEntry = {
  id: string;
  name?: string;
  labelType: "apple" | "text";
  isOpen: boolean;
  options: MenuOption[];
};

const emit = defineEmits<{
  (e: "open-window", data: WindowShallowData): void;
}>();

const menuBarRef = ref<HTMLElement | null>(null);

const allMenus = reactive<MenuEntry[]>([
  {
    id: "system",
    labelType: "apple",
    isOpen: false,
    options: [
      {
        id: "about-this-computer",
        name: "About This Computer",
        disabled: false,
        // Could move these defaults to a separate/config file
        openWindow: {
          id: "aboutThisComputer",
          content: "AboutThisComputer",
          offsetX: 40,
          offsetY: 60,
          initialX: 0,
          initialY: 0,
          height: 280,
          width: 250,
          isMaximized: false,
          unifiedBackground: true,
          disableMinimise: true,
          disableMaximise: true,
          disableResize: true,
          startCentered: true,
        },
      },
      { id: "system-preferences", name: "System Preferences", disabled: false },
      {
        id: "example-document",
        name: "Open Example Document",
        disabled: false,
        openWindow: {
          content: 'ExampleDocument',
          height: 250,
          width: 250,
          isMaximized: false,
        },
      },
    ],
  },
  {
    id: "finder",
    name: "Finder",
    labelType: "text",
    isOpen: false,
    options: [{ id: "about-finder", name: "About Finder", disabled: false }],
  },
  {
    id: "file",
    name: "File",
    labelType: "text",
    isOpen: false,
    options: [
      { id: "new", name: "New", disabled: false },
      { id: "open", name: "Open", disabled: false },
      { id: "save", name: "Save", disabled: true },
      { id: "save-as", name: "Save As", disabled: true },
      { id: "close", name: "Close", disabled: false },
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
]);

const toggleMenu = (clickedItem: MenuEntry) => {
  const wasOpen = clickedItem.isOpen;
  allMenus.forEach((item) => (item.isOpen = false));
  if (!wasOpen) {
    clickedItem.isOpen = true;
  }
};

const onMenuHover = (hoveredItem: MenuEntry) => {
  const anyOpen = allMenus.some((item) => item.isOpen);
  if (anyOpen) {
    allMenus.forEach((item) => (item.isOpen = false));
    hoveredItem.isOpen = true;
  }
};

useEventListener(document, "mousedown", (e) => {
  const el = unrefElement(menuBarRef);
  if (el && !el.contains(e.target as Node)) {
    if (allMenus.some((item) => item.isOpen)) {
      allMenus.forEach((item) => (item.isOpen = false));
    }
  }
});

const onOptionClick = (option: MenuOption) => {
  if (option.openWindow) {
    emit("open-window", option.openWindow);
    allMenus.forEach((item) => (item.isOpen = false));
  }
};
</script>

<template>
  <div
    ref="menuBarRef"
    class="relative flex flex-row items-center bg-slate-100 font-mono border-b px-3.5 h-7 border-b-black font-light"
  >
    <div
      v-for="item in allMenus"
      :key="item.id"
      :class="`relative h-full ${item.isOpen ? 'bg-blue-400 text-white' : 'text-black'} ${item.id === 'finder' ? 'font-bold' : 'font-normal'} ${item.id === 'system' ? 'pr-1.5 pl-2' : 'px-2'}`"
      @mouseenter="onMenuHover(item)"
    >
      <span
        @click="toggleMenu(item)"
        class="flex items-center justify-center h-full"
      >
        <RaphaelApple
          v-if="item.labelType === 'apple'"
          class="font-black h-full w-5"
        />
        <template v-else>{{ item.name }}</template>
      </span>
      <div
        v-if="item.isOpen && item.options.length > 0"
        class="absolute flex flex-col shrink-0 outline left-0 top-[27px] bg-slate-200 text-black tracking-tight z-9999"
      >
        <button
          v-for="option in item.options"
          :key="option.id"
          :disabled="option.disabled"
          class="flex items-center gap-2 px-3 py-1 hover:bg-blue-400 hover:text-white text-nowrap disabled:text-gray-400 disabled:hover:bg-transparent font-normal"
          @click="onOptionClick(option)"
        >
          <span>{{ option.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
