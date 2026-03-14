<script setup lang="ts">
import { ref, inject, onMounted, computed, type ComputedRef } from "vue";
import FinderItem from "@/components/ui/finder/FinderItem.vue";
import { useMenuBarStore } from "@/stores/menuBarStore";
import type { MenuEntry, WindowShallowData } from "@/types";

const appId = inject<ComputedRef<string | undefined>>("appId");
const { registerMenus } = useMenuBarStore();

function getFinderMenus(): MenuEntry[] {
  return [
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

onMounted(() => {
  if (appId?.value) {
    registerMenus(appId.value, getFinderMenus());
  }
});

export type FileSystemItem = {
  name: string;
  type: "folder" | "file" | "disk" | "other";
  customIcon?: string;
  children?: FileSystemItem[];
  openWindow?: WindowShallowData;
};

type DiskNode = { name: string; type: "disk"; children: FileSystemItem[] };

const fileSystem = ref<DiskNode[]>([
  {
    name: "Macintosh HD",
    type: "disk",
    children: [
      {
        name: "Documents",
        type: "folder",
        children: [
          {
            name: "Example Document",
            type: "file",
            openWindow: {
              content: "ExampleDocument",
              height: 250,
              width: 250,
              isMaximized: false,
            },
          },
          {
            name: "Example Document 2",
            type: "file",
            openWindow: {
              content: "ExampleDocument",
              height: 250,
              width: 250,
              isMaximized: false,
            },
          },
          {
            name: "Example Document 3",
            type: "file",
            openWindow: {
              content: "ExampleDocument",
              height: 250,
              width: 250,
              isMaximized: false,
            },
          },
        ],
      },
      { name: "Downloads", type: "folder" },
      { name: "Desktop", type: "folder" },
      { name: "Movies", type: "folder" },
      { name: "Music", type: "folder" },
      { name: "Pictures", type: "folder" },
    ],
  },
]);

const currentDirectory = ref<DiskNode | FileSystemItem>(fileSystem.value[0]);
const parentStack = ref<(DiskNode | FileSystemItem)[]>([]);
const selectedItem = ref<FileSystemItem | null>(null);
const contentEl = ref<HTMLElement | null>(null);

const openWindow = inject<(data: WindowShallowData) => void>("openWindow");

const displayedItems = computed(() => currentDirectory.value?.children ?? []);

const canGoUp = computed(() => parentStack.value.length > 0);

function goUp() {
  if (parentStack.value.length === 0) return;
  currentDirectory.value = parentStack.value.pop()!;
  selectedItem.value = null;
}

function goToHome() {
  currentDirectory.value = fileSystem.value[0];
  parentStack.value = [];
  selectedItem.value = null;
}

function onSelect(item: FileSystemItem) {
  selectedItem.value = item;
  contentEl.value?.focus();
}

function onActivate(item: FileSystemItem) {
  if (item.type === "folder") {
    parentStack.value.push(currentDirectory.value!);
    currentDirectory.value = item;
    selectedItem.value = null;
  } else if (item.type === "file" && item.openWindow && openWindow) {
    openWindow(item.openWindow);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    selectedItem.value = null;
    e.preventDefault();
    return;
  }
  if (!selectedItem.value) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onActivate(selectedItem.value);
  }
}

</script>

<template>
    <div class="w-full h-full flex flex-col *:border-black font-mono">
        <div class="finder-toolbar flex flex-row justify-between items-center gap-2 h-12 bg-slate-100 shrink-0 p-2 text-sm">
          <button
            type="button"
            class="finder-toolbar-button flex flex-row h-full rounded px-4 outline outline-black items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canGoUp"
            @click="goUp"
          >
            Up
          </button>
          <span class="text-black/40 clamp-1 text-nowrap truncate">X items, 748.2 MB available</span>
          <button class="finder-toolbar-button flex flex-row h-full rounded px-4 outline outline-black items-center justify-center gap-2" @click="goToHome">
            Home
          </button>
        </div>
        <div class="finder-content-container flex flex-col border-b overflow-scroll border-t w-full h-full bg-white">
            <div
              ref="contentEl"
              class="finder-content flex flex-row justify-start items-start content-start flex-wrap flex-1 bg-white gap-x-2 gap-y-2 p-3 outline-none"
              tabindex="0"
              aria-label="Finder contents"
              @keydown="onKeydown"
              @click.self="selectedItem = null"
            >
              <FinderItem
                v-for="item in displayedItems"
                :key="item.name"
                :name="item.name"
                :type="item.type"
                :custom-icon="item.customIcon"
                :is-selected="selectedItem === item"
                @select="onSelect(item)"
                @activate="onActivate(item)"
              />
            </div>
        </div>
    </div>
</template>