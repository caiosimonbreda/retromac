<script setup lang="ts">
import { computed } from "vue";
import folderIcon from "@/assets/icons/folder.png";
import hddIcon from "@/assets/icons/hdd.png";

const props = defineProps<{
  name: string;
  type: "folder" | "file" | "disk" | "other";
  customIcon?: string;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "activate"): void;
}>();

const icon = computed(() => {
  if (props.type === "disk") {
    return hddIcon;
  }
  return folderIcon;
});
</script>

<template>
  <div
    class="finder-item flex flex-col w-28 items-center justify-center gap-1 text-sm cursor-pointer rounded transition-colors py-1.5 font-mono"
    :class="[
      isSelected
        ? 'bg-blue-400 text-white'
        : 'bg-transparent',
    ]"
    @click="emit('select')"
    @dblclick="emit('activate')"
  >
    <div class="finder-item-icon w-14">
      <img v-if="customIcon" :src="customIcon" draggable="false" />
      <img v-else :src="icon" draggable="false" />
    </div>
    <div class="finder-item-name w-full h-full text-center clamp-2 px-0.5">
      {{ name }}
    </div>
  </div>
</template>