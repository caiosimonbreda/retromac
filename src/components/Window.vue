<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
    zIndex: number,
}>(), {

})

const { width, height } = useWindowSize()

const w = reactive({
    isDragging: false,
    offsetX: 40,
    offsetY: 60,
    initialX: 0,
    initialY: 0,
    height: 250,
    width: 250,
})

const margin = 12
const menuBarHeight = 28


// Window dragging and resizing:
let isDragging = false
let isResizing = false

const startDrag = (event: any) => {
    isDragging = true
    if (event.type.includes('touch')) {
        w.initialX = event.touches[0].clientX
        w.initialY = event.touches[0].clientY
    } else {
        w.initialX = event.clientX
        w.initialY = event.clientY
    }
}

const startResize = () => {
    isResizing = true
}

const onDocumentMouseMove = (event: any) => {
    let eventX = 0
    let eventY = 0

    if (event.type.includes('touch')) {
        eventX = Math.floor(event.touches[0].clientX)
        eventY = Math.floor(event.touches[0].clientY)
    } else {
        eventX = event.clientX
        eventY = event.clientY
    }

    if (isDragging) {
        const deltaX = eventX - w.initialX
        const deltaY = eventY - w.initialY

        // Calculate new position with boundaries
        let newOffsetX = w.offsetX + deltaX;
        let newOffsetY = w.offsetY + deltaY;

        // Constrain X position within margins
        const maxX = width.value - w.width - margin;
        newOffsetX = Math.min(maxX, Math.max(margin, newOffsetX));

        // Constrain Y position within margins
        const maxY = height.value - w.height - margin;
        newOffsetY = Math.min(maxY, Math.max(margin + menuBarHeight, newOffsetY));

        w.offsetX = newOffsetX;
        w.offsetY = newOffsetY;
        w.initialX = eventX;
        w.initialY = eventY;
    }

    if (isResizing) {
        const initialCornerX = w.offsetX + w.width
        const initialCornerY = w.offsetY + w.height

        const deltaX = eventX - initialCornerX
        const deltaY = eventY - initialCornerY

        if (w.width + deltaX >= 200) {
            if (w.width + deltaX + w.offsetX > width.value - margin) {
                w.width = width.value - w.offsetX - margin
            } else {
                w.width += deltaX
            }
        }
        if (w.height + deltaY >= 200) {
            if (w.height + deltaY + w.offsetY > height.value - margin) {
                w.height = height.value - w.offsetY - margin
            } else {
                w.height += deltaY
            }
        }
    }
}


const onDocumentMouseUp = () => {
    isDragging = false
    isResizing = false
}

onMounted(() => {
    document.addEventListener('mousemove', onDocumentMouseMove)
    document.addEventListener('touchmove', onDocumentMouseMove)
    document.addEventListener('mouseup', onDocumentMouseUp)
    document.addEventListener('touchend', onDocumentMouseUp)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDocumentMouseMove)
    document.removeEventListener('touchmove', onDocumentMouseMove)
    document.removeEventListener('mouseup', onDocumentMouseUp)
    document.removeEventListener('touchend', onDocumentMouseUp)
})

</script>

<template>
    <div :class="`absolute flex flex-col justify-between bg-white outline outline-1 outline-black rounded-md overflow-hidden shadow-xl`"
        :style="{ left: w.offsetX + 'px', top: w.offsetY + 'px', width: w.width + 'px', height: w.height + 'px', zIndex: props.zIndex }">
        <div class="flex flex-row items-center px-2.5 outline outline-1 outline-black bg-slate-100 h-6 shrink-0"
            :style="{ zIndex: props.zIndex + 1 }" @touchstart="startDrag" @mousedown="startDrag">
            <div class="flex flex-row items-center h-full gap-2">
                <div class="h-2.5 w-2.5 bg-red-400 rounded-full outline outline-1 outline-black"></div>
                <div class="h-2.5 w-2.5 bg-yellow-400 rounded-full outline outline-1 outline-black"></div>
                <div class="h-2.5 w-2.5 bg-emerald-400 rounded-full outline outline-1 outline-black"></div>
            </div>
        </div>
        <main class="overflow-scroll scroll-smooth h-full">
            <slot></slot>
        </main>
        <footer class="flex justify-end flex-row bg-slate-100 outline outline-1 outline-black w-full shrink-0 h-4">
            <div class="flex h-full w-4 p-1 bg-transparent cursor-nwse-resize" @touchstart="startResize"
                @mousedown="startResize">
                <div class="h-full w-full rounded-sm bg-slate-300"></div>
            </div>
        </footer>
    </div>
</template>
