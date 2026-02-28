<script setup lang="ts">
import {
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  computed,
} from "vue";
import { useWindowSize } from "@vueuse/core";
import type { WindowData } from "@/types";

const props = withDefaults(
  defineProps<{
    windowData: WindowData;
    windowIndex: number;
  }>(),
  {},
);

const emit = defineEmits<{
  (e: "close", windowIndex: number): void;
  (
    e: "update",
    payload: Pick<
      WindowData,
      "offsetX" | "offsetY" | "initialX" | "initialY" | "width" | "height"
    >,
  ): void;
}>();

const { width: browserWidth, height: browserHeight } = useWindowSize();

const margin = 12;
const menuBarHeight = 27;
const DRAG_THRESHOLD_PX = 5;

// Local reactive copy – mutated during drag/resize, emitted on completion
const local = reactive({
  offsetX: props.windowData.offsetX,
  offsetY: props.windowData.offsetY,
  initialX: props.windowData.initialX,
  initialY: props.windowData.initialY,
  width: props.windowData.width,
  height: props.windowData.height,
  isMaximized: props.windowData.isMaximized,
});

// Sync from props when parent updates (e.g. zIndex change), but not during interaction
let isDragging = false;
let isResizing = false;
let isPendingDrag = false; // mousedown but not yet moved past threshold (avoid click misinterpretation)
let dragStartX = 0;
let dragStartY = 0;

watch(
  () => props.windowData,
  (newData) => {
    if (!isDragging && !isResizing) {
      local.offsetX = newData.offsetX;
      local.offsetY = newData.offsetY;
      local.initialX = newData.initialX;
      local.initialY = newData.initialY;
      local.width = newData.width;
      local.height = newData.height;
    }
  },
  { deep: true },
);

const startDrag = (event: any) => {
  isPendingDrag = true;
  if (event.type.includes("touch")) {
    dragStartX = event.touches[0].clientX;
    dragStartY = event.touches[0].clientY;
  } else {
    dragStartX = event.clientX;
    dragStartY = event.clientY;
  }
};

const startResize = () => {
  isResizing = true;
};

const onDocumentMouseMove = (event: any) => {
  let eventX = 0;
  let eventY = 0;

  if (event.type.includes("touch")) {
    eventX = Math.floor(event.touches[0].clientX);
    eventY = Math.floor(event.touches[0].clientY);
  } else {
    eventX = event.clientX;
    eventY = event.clientY;
  }

  // Commit to drag only after moving past threshold (avoids click misinterpretation)
  if (isPendingDrag) {
    const dx = eventX - dragStartX;
    const dy = eventY - dragStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      isPendingDrag = false;
      isDragging = true;
      if (local.isMaximized) {
        local.offsetX = margin;
        local.offsetY = margin + menuBarHeight;
        local.isMaximized = false;
      }
      local.initialX = dragStartX;
      local.initialY = dragStartY;
    }
  }

  if (isDragging) {
    const deltaX = eventX - local.initialX;
    const deltaY = eventY - local.initialY;

    let newOffsetX = local.offsetX + deltaX;
    let newOffsetY = local.offsetY + deltaY;

    const maxX = browserWidth.value - local.width - margin;
    newOffsetX = Math.min(maxX, Math.max(margin, newOffsetX));

    const maxY = browserHeight.value - local.height - margin;
    newOffsetY = Math.min(maxY, Math.max(margin + menuBarHeight, newOffsetY));

    local.offsetX = newOffsetX;
    local.offsetY = newOffsetY;
    local.initialX = eventX;
    local.initialY = eventY;
  }

  if (isResizing) {
    const initialCornerX = local.offsetX + local.width;
    const initialCornerY = local.offsetY + local.height;

    const deltaX = eventX - initialCornerX;
    const deltaY = eventY - initialCornerY;

    if (local.width + deltaX >= 200) {
      if (local.width + deltaX + local.offsetX > browserWidth.value - margin) {
        local.width = browserWidth.value - local.offsetX - margin;
      } else {
        local.width += deltaX;
      }
    }
    if (local.height + deltaY >= 200) {
      if (
        local.height + deltaY + local.offsetY >
        browserHeight.value - margin
      ) {
        local.height = browserHeight.value - local.offsetY - margin;
      } else {
        local.height += deltaY;
      }
    }
  }
};

const onDocumentMouseUp = () => {
  if (isPendingDrag) {
    isPendingDrag = false;
  }
  if (isDragging || isResizing) {
    emit("update", {
      offsetX: local.offsetX,
      offsetY: local.offsetY,
      initialX: local.initialX,
      initialY: local.initialY,
      width: local.width,
      height: local.height,
    });
  }
  isDragging = false;
  isResizing = false;
};

// Maximize and restore:
const originalWidth = ref(250);
const originalHeight = ref(250);

const toggleMaximisation = () => {
  if (local.isMaximized) {
    local.isMaximized = false;
    local.width = originalWidth.value;
    local.height = originalHeight.value;
    // necessary?
  } else {
    originalWidth.value = local.width;
    originalHeight.value = local.height;
    local.isMaximized = true;
  }
};

const maximisedDimensions = computed(() => {
  return {
    width: browserWidth.value - margin * 2,
    height: browserHeight.value - margin * 2 - menuBarHeight,
  };
});

// Lifecycle events:
onMounted(() => {
  document.addEventListener("mousemove", onDocumentMouseMove);
  document.addEventListener("touchmove", onDocumentMouseMove);
  document.addEventListener("mouseup", onDocumentMouseUp);
  document.addEventListener("touchend", onDocumentMouseUp);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onDocumentMouseMove);
  document.removeEventListener("touchmove", onDocumentMouseMove);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  document.removeEventListener("touchend", onDocumentMouseUp);
});
</script>

<template>
  <div
    :class="`absolute flex flex-col justify-between bg-white outline rounded-xl ${local.isMaximized ? 'rounded-t-none' : ''} overflow-hidden shadow-xl`"
    :style="{
      left: local.isMaximized ? margin + 'px' : local.offsetX + 'px',
      top: local.isMaximized
        ? margin + menuBarHeight + 'px'
        : local.offsetY + 'px',
      width: local.isMaximized
        ? maximisedDimensions.width + 'px'
        : local.width + 'px',
      height: local.isMaximized
        ? maximisedDimensions.height + 'px'
        : local.height + 'px',
      zIndex: windowData.zIndex,
    }"
  >
    <div
      class="flex flex-row items-center px-2.5 outline bg-slate-100 h-6 shrink-0"
      :style="{ zIndex: windowData.zIndex + 1 }"
      @touchstart="startDrag"
      @mousedown="startDrag"
    >
      <div class="flex flex-row items-center h-full gap-2">
        <div
          class="h-2.5 w-2.5 bg-red-400 hover:bg-red-300 active:bg-red-500 rounded-full outline"
          @mousedown.stop
          @touchstart.stop
          @click.stop="emit('close', windowIndex)"
        ></div>
        <div
          class="h-2.5 w-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-full outline"
          @mousedown.stop
          @touchstart.stop
        ></div>
        <div
          class="h-2.5 w-2.5 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-full outline"
          @mousedown.stop
          @touchstart.stop
          @click="toggleMaximisation"
        ></div>
      </div>
    </div>
    <main class="overflow-scroll scroll-smooth h-full">
      <slot></slot>
    </main>
    <footer
      class="flex justify-end flex-row bg-slate-100 outline w-full shrink-0 h-4"
    >
      <div
        v-if="!local.isMaximized"
        class="flex h-full w-4 p-1 bg-transparent cursor-nwse-resize"
        @touchstart="startResize"
        @mousedown="startResize"
      >
        <div class="h-full w-full rounded-sm bg-slate-300"></div>
      </div>
    </footer>
  </div>
</template>
