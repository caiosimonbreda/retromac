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
  <div class="flex flex-col items-center justify-center px-3 py-6 bg-transparent text-center h-full w-full gap-4">
    <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-wixmp-ed30a86b8c4ca887773594c2.wixmp.com%2Ff%2F2a8cce5b-ceba-45ce-a20c-ca454045e67a%2Fddmhc1l-249e0b0b-db39-4363-bef1-e5adae45094d.png%2Fv1%2Ffill%2Fw_353%2Ch_369%2Fmac_os_9_classic_finder_icon_by_john7johny_ddmhc1l-fullview.png%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MzY5IiwicGF0aCI6IlwvZlwvMmE4Y2NlNWItY2ViYS00NWNlLWEyMGMtY2E0NTQwNDVlNjdhXC9kZG1oYzFsLTI0OWUwYjBiLWRiMzktNDM2My1iZWYxLWU1YWRhZTQ1MDk0ZC5wbmciLCJ3aWR0aCI6Ijw9MzUzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.kYOc7CCPD2i4dvkG6pCyjWCNlCxSrVaXFPdllREW-0I&f=1&nofb=1&ipt=b680ebecb28dac218929fd3901f87166837d4bae0f1dc56462ebd5a289eb0e9b" class="w-14 h-14 brightness-140 drop-shadow-sm">
    <h1 class="font-black text-xl font-mono w-full">Finder</h1>
    <div class="flex flex-row w-full items-center justify-center gap-2 text-xs">
        <div class="flex flex-col gap-1 text-neutral-500 *:text-nowrap w-full *:w-full">
            <span>The Macintosh Desktop Experience</span>
            <span>Copyright © 1983-2026 Apple Inc.</span>
            <span>Version 1.0</span>
        </div>
    </div>
  </div>
</template>
