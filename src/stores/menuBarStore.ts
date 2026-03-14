import { ref, reactive } from "vue";
import type { MenuEntry } from "@/types";
import { getSystemMenu } from "./defaultMenus";

function cloneMenus(menus: MenuEntry[]): MenuEntry[] {
  return JSON.parse(
    JSON.stringify(menus.map((m) => ({ ...m, isOpen: false }))),
  );
}

function cloneSingle(menu: MenuEntry): MenuEntry {
  return cloneMenus([menu])[0];
}

const menuRegistry: Record<string, MenuEntry[]> = reactive(
  Object.create(null),
);
const activeAppId = ref<string | null>(null);
const activeMenus = ref<MenuEntry[]>([]);

export function useMenuBarStore() {
  function registerMenus(appId: string, menus: MenuEntry[]) {
    menuRegistry[appId] = cloneMenus(menus);
    if (activeAppId.value === appId) {
      setActiveApp(appId);
    }
  }

  function setActiveApp(appId: string | null) {
    activeAppId.value = appId;
    const appTemplate =
      (appId && menuRegistry[appId]) || menuRegistry["desktop"] || [];
    const systemMenu = cloneSingle(getSystemMenu());
    activeMenus.value = [systemMenu, ...cloneMenus(appTemplate)];
  }

  function getActiveMenus() {
    return activeMenus;
  }

  return {
    activeAppId,
    registerMenus,
    setActiveApp,
    getActiveMenus,
  };
}
