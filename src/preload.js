const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("axuan", {
  moveBy(dx, dy) {
    if (Number.isFinite(dx) && Number.isFinite(dy)) {
      ipcRenderer.send("pet:move-by", dx, dy);
    }
  },
  openMenu() {
    ipcRenderer.send("pet:open-menu");
  },
  onReminder(callback) {
    const listener = (_event, message) => callback(message);
    ipcRenderer.on("pet:reminder", listener);
    return () => ipcRenderer.removeListener("pet:reminder", listener);
  },
});
