<script setup lang="ts">
import { ref } from "vue";
import { useEventListener, unrefElement } from "@vueuse/core";
import RaphaelApple from "@/icons/RaphaelApple.vue";
import type { WindowShallowData, MenuEntry, MenuOption } from "@/types";
import { useMenuBarStore } from "@/stores/menuBarStore";

const emit = defineEmits<{
  (e: "open-window", data: WindowShallowData): void;
}>();

const { getActiveMenus } = useMenuBarStore();
const allMenus = getActiveMenus();

const menuBarRef = ref<HTMLElement | null>(null);

const toggleMenu = (clickedItem: MenuEntry) => {
  const wasOpen = clickedItem.isOpen;
  allMenus.value.forEach((item) => (item.isOpen = false));
  if (!wasOpen) {
    clickedItem.isOpen = true;
  }
};

const onMenuHover = (hoveredItem: MenuEntry) => {
  const anyOpen = allMenus.value.some((item) => item.isOpen);
  if (anyOpen) {
    allMenus.value.forEach((item) => (item.isOpen = false));
    hoveredItem.isOpen = true;
  }
};

useEventListener(document, "mousedown", (e) => {
  const el = unrefElement(menuBarRef);
  if (el && !el.contains(e.target as Node)) {
    if (allMenus.value.some((item) => item.isOpen)) {
      allMenus.value.forEach((item) => (item.isOpen = false));
    }
  }
});

const onOptionClick = (option: MenuOption) => {
  if (option.openWindow) {
    emit("open-window", option.openWindow);
    allMenus.value.forEach((item) => (item.isOpen = false));
  }
};
</script>

<template>
  <div
    ref="menuBarRef"
    class="relative flex flex-row items-center bg-slate-100 font-mono border-b px-3.5 h-7 border-b-black font-light"
  >
    <div
      v-for="(item, index) in allMenus"
      :key="item.id"
      :class="[
        'relative h-full',
        item.isOpen ? 'bg-blue-400 text-white' : 'text-black',
        index === 1 ? 'font-bold' : 'font-normal',
        item.id === 'system' ? 'pr-1.5 pl-2' : 'px-2',
      ]"
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
