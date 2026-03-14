import type { MenuEntry } from "@/types";

export function getSystemMenu(): MenuEntry {
  return {
    id: "system",
    labelType: "apple",
    isOpen: false,
    options: [
      {
        id: "about-this-computer",
        name: "About This Computer",
        disabled: false,
        openWindow: {
          id: "aboutThisComputer",
          content: "AboutThisComputer",
          offsetX: 40,
          offsetY: 60,
          initialX: 0,
          initialY: 0,
          height: 320,
          width: 250,
          isMaximized: false,
          unifiedBackground: true,
          disableMinimise: true,
          disableMaximise: true,
          disableResize: true,
          startCentered: true,
        },
      },
      { id: "system-preferences", name: "System Preferences", disabled: false },
      {
        id: "example-document",
        name: "Open Example Document",
        disabled: false,
        openWindow: {
          content: "DocumentReader",
          height: 250,
          width: 250,
          isMaximized: false,
        },
      },
    ],
  };
}

/** App menus only (desktop/Finder). System menu is always added by the store. */
export function getDefaultMenus(): MenuEntry[] {
  return [
    {
      id: "finder",
      name: "Finder",
      labelType: "text",
      isOpen: false,
      options: [
        {
          id: "about-finder",
          name: "About Finder",
          disabled: false,
          openWindow: {
            id: "aboutFinder",
            content: "AboutFinder",
            offsetX: 40,
            offsetY: 60,
            initialX: 0,
            initialY: 0,
            height: 280,
            width: 250,
            isMaximized: false,
            unifiedBackground: true,
            disableMinimise: true,
            disableMaximise: true,
            disableResize: true,
            startCentered: true,
          },
        },
      ],
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
            isMaximized: false,
            unifiedBackground: true,
            height: 360,
            width: 460,
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
