<script setup lang="ts">
import { computed } from "vue";
import type { WindowData } from "@/types";

const props = withDefaults(
  defineProps<{
    windowData: WindowData;
    windowIndex: number;
    isActive?: boolean;
  }>(),
  { isActive: true },
);

const emit = defineEmits<{
  (e: "close", windowIndex: number): void;
  (e: "maximise-toggle"): void;
  (e: "drag-start", event: MouseEvent | TouchEvent): void;
}>();

const buttonBaseClasses =
  "h-2.5 w-2.5 rounded-full outline disabled:bg-neutral-200 disabled:hover:bg-neutral-200 disabled:active:bg-neutral-200 disabled:outline-neutral-400";

const inactiveOverlayClasses = computed(() =>
  props.isActive ? "" : "bg-slate-200!",
);

const closeButtonClasses = computed(
  () =>
    `${buttonBaseClasses} bg-red-400 hover:bg-red-300 active:bg-red-500 ${inactiveOverlayClasses.value}`,
);

const minimiseButtonClasses = computed(
  () =>
    `${buttonBaseClasses} bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 ${inactiveOverlayClasses.value}`,
);

const maximiseButtonClasses = computed(
  () =>
    `${buttonBaseClasses} bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 ${inactiveOverlayClasses.value}`,
);
</script>

<template>
  <div
    :class="`flex flex-row items-center px-2.5 ${props.windowData.unifiedBackground ? 'outline-none' : 'outline'} h-6 shrink-0 outline`"
    :style="{ zIndex: props.windowData.zIndex + 1 }"
    @touchstart="emit('drag-start', $event)"
    @mousedown="emit('drag-start', $event)"
  >
    <div class="title-bar flex flex-row items-center h-full gap-2">
      <button
        :disabled="props.windowData.disableClose"
        :class="closeButtonClasses"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('close', props.windowIndex)"
      ></button>
      <button
        :disabled="props.windowData.disableMinimise"
        :class="minimiseButtonClasses"
        @mousedown.stop
        @touchstart.stop
      ></button>
      <button
        :disabled="props.windowData.disableMaximise"
        :class="maximiseButtonClasses"
        @mousedown.stop
        @touchstart.stop
        @click="emit('maximise-toggle')"
      ></button>
    </div>
  </div>
</template>
