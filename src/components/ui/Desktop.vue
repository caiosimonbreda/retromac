<script setup lang="ts">
import { shallowRef, ref, triggerRef } from "vue";
import type { WindowData } from "@/types";
import MenuBar from "@/components/ui/MenuBar.vue";
import Window from "@/components/ui/Window.vue";
import binIcon from "@/assets/icons/bin4.png";
import ExampleDocument from "@/components/programs/ExampleDocument.vue";
import TestProgram from "@/components/programs/TestProgram.vue";

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

const isMobile = isMobileDevice();

const windows = shallowRef<WindowData[]>([
  {
    id: "exampleDocument",
    content: ExampleDocument,
    zIndex: 0,
    offsetX: 40,
    offsetY: 60,
    initialX: 0,
    initialY: 0,
    height: 250,
    width: 250,
    isMaximized: false,
  },
  {
    id: "testProgram",
    content: TestProgram,
    zIndex: 1,
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
]);

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
      class="flex flex-col bg-slate-400 rounded-2xl h-full w-full overflow-hidden overscroll-none"
    >
      <MenuBar />
      <div class="flex h-full w-full p-6 items-end justify-end">
        <div class="flex flex-col gap-1 justify-center items-center">
          <img class="w-16 h-16" :src="binIcon" />
          <label class="text-sm font-mono">Trash</label>
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
