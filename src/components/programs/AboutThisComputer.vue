<script setup lang="ts">
import { inject, onMounted, type ComputedRef } from "vue";
import { useMenuBarStore } from "@/stores/menuBarStore";
import type { MenuEntry } from "@/types";

const appId = inject<ComputedRef<string | undefined>>("appId");
const { registerMenus } = useMenuBarStore();

function getAboutThisComputerMenus(): MenuEntry[] {
  return [
    {
      id: "about",
      name: "About",
      labelType: "text",
      isOpen: false,
      options: [],
    },
  ];
}

onMounted(() => {
  if (appId?.value) {
    registerMenus(appId.value, getAboutThisComputerMenus());
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center px-3 py-8 bg-transparent text-center h-full w-full gap-4">
    <img src="@/assets/icons/mac.png" class="h-20 my-2 brightness-110 drop-shadow-sm">
    <h1 class="font-black text-xl font-mono">PowerMac M2</h1>
    <div class="flex flex-row w-full items-center justify-center gap-2 text-xs">
        <div class="flex flex-col text-right gap-1 *:text-nowrap w-full">
            <span>OS</span>
            <span>Chip</span>
            <span>Memory</span>
            <span>Storage</span>
        </div>
        <div class="flex flex-col text-left gap-1 text-neutral-500 *:text-nowrap w-full">
            <span>Mac OS 8.1</span>
            <span>Motorola 68K</span>
            <span>2 MB</span>
            <span>512 GB</span>
        </div>
    </div>
  </div>
</template>
