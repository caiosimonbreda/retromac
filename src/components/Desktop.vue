<script setup lang="ts">
import { ref } from "vue";
import type { WindowData } from "@/types";
import MenuBar from "@/components/MenuBar.vue";
import Window from "@/components/Window.vue";
import binIcon from "@/assets/icons/bin4.png";

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

const isMobile = isMobileDevice();

/* 
Create an active windows array. Clicking an icon or selecting a menu 
option will add a window to this array, and a v-for will be used to
render multiple window instances.
*/

const activeWindows = ref<WindowData[]>([
  {
    id: "macWindow",
    content: "bg-emerald-100",
    zIndex: 1,
    offsetX: 40,
    offsetY: 60,
    initialX: 0,
    initialY: 0,
    height: 250,
    width: 250,
    isMaximized: false,
  },
  {
    id: "otherWindow",
    content: "bg-purple-100",
    zIndex: 2,
    offsetX: 40,
    offsetY: 60,
    initialX: 0,
    initialY: 0,
    height: 250,
    width: 250,
    isMaximized: false,
  },
  {
    id: "lmaoEven",
    content: "bg-red-100",
    zIndex: 3,
    offsetX: 40,
    offsetY: 60,
    initialX: 0,
    initialY: 0,
    height: 250,
    width: 250,
    isMaximized: false,
  },
]);

const onWindowFocus = (windowIndex: number) => {
  const windowToPop = activeWindows.value.splice(windowIndex, 1);
  windowToPop[0].zIndex = activeWindows.value.length;
  activeWindows.value.push(windowToPop[0]);
};

// When deleting a window, re-assign all Z-indexes to window index + 1 (still necessary?)

const closeWindow = (windowIndex: number) => {
  activeWindows.value.splice(windowIndex, 1);
};

const onWindowUpdate = (
  windowIndex: number,
  payload: Pick<
    WindowData,
    "offsetX" | "offsetY" | "initialX" | "initialY" | "width" | "height"
  >,
) => {
  const window = activeWindows.value[windowIndex];
  if (window) {
    Object.assign(window, payload);
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
      <!-- <Window :window-index="0" :z-index="40">
        <div class="p-3">
          <h1 class="font-black text-xl pb-3 font-mono">Apple Computer Inc.</h1>
          <p class="font-mono">The 1990s was the decade when Apple gained a comparative advantage in the personal
            computers field by
            portraying their products as cool, innovative, fun and well designed (1998 – Chic. Not Geek campaign,
            1999 – the Thrill of Surfing campaign and so forth). Furthermore, it was the 1990s who triggered the
            famous Think different slogan. From this point one, the road they’ve taken seems irreversible and will
            steadily transform Apple into the huge company that it is today. </p>
        </div>
      </Window> -->

      <Window
        v-for="(window, windowIndex) in activeWindows"
        :window-data="window"
        :window-index="windowIndex"
        :key="window.id"
        @mousedown="onWindowFocus(windowIndex)"
        @touchstart="onWindowFocus(windowIndex)"
        @close="closeWindow(windowIndex)"
        @update="(payload) => onWindowUpdate(windowIndex, payload)"
      >
        <div :class="`h-full w-full ${window.content}`"></div>
      </Window>
    </main>
  </div>
</template>
