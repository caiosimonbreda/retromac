import type { Component } from "vue";

export interface WindowData {
  id?: string;
  content?: Component;
  windowIndex?: number;
  zIndex: number;
  offsetX: number;
  offsetY: number;
  initialX: number;
  initialY: number;
  height: number;
  width: number;
  isMaximized?: boolean;
  disableClose?: boolean;
  disableMaximise?: boolean;
  disableMinimise?: boolean;
  disableResize?: boolean;
  unifiedBackground?: boolean;
  startCentered?: boolean;
}
