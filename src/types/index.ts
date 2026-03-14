import type { Component } from "vue";

export interface MenuOption {
  id: string;
  name: string;
  disabled: boolean;
  openWindow?: WindowShallowData;
}

export interface MenuEntry {
  id: string;
  name?: string;
  labelType: "apple" | "text";
  isOpen: boolean;
  options: MenuOption[];
}

export interface WindowData {
  id?: string;
  title?: string;
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

export interface WindowShallowData {
  id?: string;
  title?: string;
  content: string;
  offsetX?: number;
  offsetY?: number;
  initialX?: number;
  initialY?: number;
  height?: number;
  width?: number;
  isMaximized?: boolean;
  unifiedBackground?: boolean;
  disableMinimise?: boolean;
  disableMaximise?: boolean;
  disableResize?: boolean;
  startCentered?: boolean;
}
