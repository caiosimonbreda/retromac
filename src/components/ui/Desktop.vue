<script setup lang="ts">
import { shallowRef, ref, triggerRef } from "vue";
import type { WindowData, WindowShallowData } from "@/types";
import MenuBar from "@/components/ui/MenuBar.vue";
import Window from "@/components/ui/Window.vue";
import binIcon from "@/assets/icons/bin4.png";
import folderIcon from "@/assets/icons/folder.png";

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

const isMobile = isMobileDevice();

const windows = shallowRef<WindowData[]>([]);

const activeWindowId = ref<string | null>(windows.value[0]?.id ?? null);

const onWindowFocus = (windowIndex: number) => {
  const windowToPop = windows.value.splice(windowIndex, 1);
  windowToPop[0].zIndex = windows.value.length;
  windows.value.push(windowToPop[0]);
  activeWindowId.value = windowToPop[0].id ?? null;
  triggerRef(windows);
};

const closeWindow = (windowIndex: number) => {
  const closedWindow = windows.value[windowIndex];
  const wasActive = closedWindow?.id === activeWindowId.value;
  windows.value.splice(windowIndex, 1);
  if (wasActive && windows.value.length > 0) {
    const topWindow = windows.value.reduce((a, b) =>
      (a.zIndex > b.zIndex ? a : b),
    );
    activeWindowId.value = topWindow?.id ?? null;
  } else if (windows.value.length === 0) {
    activeWindowId.value = null;
  }
  triggerRef(windows);
};

const handleOpenWindow = async (data: WindowShallowData) => {
  if (data.id && windows.value.find((window) => window.id === data.id)) {
    onWindowFocus(windows.value.findIndex((window) => window.id === data.id))
    return
  };
  
  const componentName = data.content;
  if (!componentName) return;

  const { default: component } = await import(
    `@/components/programs/${componentName}.vue`
  );

  const maxZ = windows.value.reduce(
    (max, w) => Math.max(max, w.zIndex),
    0,
  );

  const newWindow: WindowData = {
    ...data,
    id: data.id ?? `window-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    offsetX: data.offsetX ?? 40,
    offsetY: data.offsetY ?? 60,
    initialX: data.initialX ?? 0,
    initialY: data.initialY ?? 0,
    height: data.height ?? 250,
    width: data.width ?? 250,
    content: component,
    zIndex: maxZ + 1,
  };

  windows.value = [...windows.value, newWindow];
  activeWindowId.value = newWindow.id ?? null;

  // TODO: Store the new window data in local storage

};

const onWindowUpdate = (
  windowIndex: number,
  payload: Pick<
    WindowData,
    "offsetX" | "offsetY" | "initialX" | "initialY" | "width" | "height"
  >,
) => {
  const window = windows.value[windowIndex];
  if (window) {
    Object.assign(window, payload);
    triggerRef(windows);
  }

  // TODO: Store the updated window data in local storage
};
</script>

<template>
  <div :class="`${isMobile ? 'h-[90svh]' : 'h-screen'} w-screen p-3`">
    <main
      class="flex flex-col bg-linear-to-b from-slate-400 to-slate-500 rounded-2xl h-full w-full overflow-hidden overscroll-none"
    >
      <MenuBar @open-window="handleOpenWindow" />
      <div class="flex flex-col h-full w-full p-6 items-end justify-start gap-5">
        <div class="flex flex-col gap-1.5 justify-center items-center" @dblclick="handleOpenWindow({ content: 'ExampleDocument' })">
          <img class="w-15" :src="folderIcon" />
          <label class="text-sm font-mono">Documents</label>
        </div>
      </div>
      <Window
        v-for="(window, windowIndex) in windows"
        :key="window.id"
        :window-data="window"
        :window-index="windowIndex"
        :is-active="window.id === activeWindowId"
        @mousedown="onWindowFocus(windowIndex)"
        @touchstart="onWindowFocus(windowIndex)"
        @close="closeWindow(windowIndex)"
        @update="(payload) => onWindowUpdate(windowIndex, payload)"
      >
        <component :is="window.content" />
      </Window>
    </main>
  </div>
</template>
