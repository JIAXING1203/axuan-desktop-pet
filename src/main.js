const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  screen,
  Tray,
} = require("electron");
const { DEFAULT_SCHEDULE, isReminderTime, reminderKey } = require("./reminder");

const WINDOW_WIDTH = 340;
const WINDOW_HEIGHT = 330;
const CHECK_INTERVAL_MS = 15_000;

let petWindow = null;
let tray = null;
let reminderTimer = null;
let lastReminderKey = null;
let quitting = false;
let settings = { petVisible: true, remindersEnabled: true };

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function loadSettings() {
  try {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsPath(), "utf8")) };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Unable to load settings:", error.message);
    }
  }
}

function saveSettings() {
  fs.writeFileSync(settingsPath(), `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createPetWindow() {
  const workArea = screen.getPrimaryDisplay().workArea;
  petWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: workArea.x + workArea.width - WINDOW_WIDTH - 24,
    y: workArea.y + workArea.height - WINDOW_HEIGHT - 16,
    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  petWindow.setAlwaysOnTop(true, "floating");
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadFile(path.join(__dirname, "index.html"));
  petWindow.once("ready-to-show", () => {
    if (settings.petVisible) petWindow.showInactive();
  });
  petWindow.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      setPetVisible(false);
    }
  });
}

function setPetVisible(visible) {
  settings.petVisible = visible;
  saveSettings();
  if (visible) petWindow?.showInactive();
  else petWindow?.hide();
  if (tray) tray.setContextMenu(buildMenu());
}

function movePetBy(dx, dy) {
  if (!petWindow || petWindow.isDestroyed()) return;
  const bounds = petWindow.getBounds();
  const display = screen.getDisplayNearestPoint({
    x: bounds.x + Math.round(bounds.width / 2),
    y: bounds.y + Math.round(bounds.height / 2),
  });
  const area = display.workArea;
  const x = clamp(bounds.x + Math.round(dx), area.x, area.x + area.width - bounds.width);
  const y = clamp(bounds.y + Math.round(dy), area.y, area.y + area.height - bounds.height);
  petWindow.setPosition(x, y, false);
}

function showReminder() {
  if (!petWindow || petWindow.isDestroyed()) return;
  const iconPath = path.join(__dirname, "..", "assets", "icon.png");
  if (Notification.isSupported()) {
    new Notification({
      title: DEFAULT_SCHEDULE.title,
      body: DEFAULT_SCHEDULE.message,
      icon: iconPath,
      silent: false,
    }).show();
  }
  if (settings.petVisible) {
    petWindow.showInactive();
    petWindow.webContents.send("pet:reminder", DEFAULT_SCHEDULE.message);
  }
  if (settings.petVisible && process.platform === "darwin" && app.dock) {
    app.dock.bounce("informational");
  }
}

function checkReminder(now = new Date()) {
  if (!settings.remindersEnabled || !isReminderTime(now)) return;
  const key = reminderKey(now);
  if (key === lastReminderKey) return;
  lastReminderKey = key;
  showReminder();
}

function openAtLogin() {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch {
    return false;
  }
}

function setOpenAtLogin(enabled) {
  try {
    app.setLoginItemSettings({ openAtLogin: enabled });
  } catch (error) {
    dialog.showErrorBox("无法修改开机启动", error.message);
  }
}

function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "显示桌宠",
      type: "checkbox",
      checked: settings.petVisible,
      click: (item) => setPetVisible(item.checked),
    },
    {
      label: "喝水提醒",
      type: "checkbox",
      checked: settings.remindersEnabled,
      click: (item) => {
        settings.remindersEnabled = item.checked;
        saveSettings();
      },
    },
    {
      label: "开机启动",
      type: "checkbox",
      checked: openAtLogin(),
      click: (item) => setOpenAtLogin(item.checked),
    },
    { type: "separator" },
    {
      label: "测试喝水提醒",
      click: () => showReminder(),
    },
    {
      label: "使用说明",
      click: () =>
        dialog.showMessageBox(petWindow, {
          type: "info",
          title: "阿璇桌宠",
          message: "拖动阿璇可以移动位置，单击会随机播放可爱动作。",
          detail:
            "工作日 10:00–22:00 每个整点提醒喝水和活动。隐藏后，点击菜单栏或系统托盘中的阿璇图标，再勾选“显示桌宠”即可恢复。",
        }),
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        quitting = true;
        app.quit();
      },
    },
  ]);
}

function createTray() {
  const icon = nativeImage
    .createFromPath(path.join(__dirname, "..", "assets", "icon.png"))
    .resize({ width: 24, height: 24 });
  tray = new Tray(icon);
  tray.setToolTip("阿璇桌宠");
  tray.setContextMenu(buildMenu());
  tray.on("click", () => {
    setPetVisible(!petWindow?.isVisible());
  });
}

function registerIpc() {
  ipcMain.on("pet:move-by", (_event, dx, dy) => {
    if (Number.isFinite(dx) && Number.isFinite(dy)) movePetBy(dx, dy);
  });
  ipcMain.on("pet:open-menu", () => {
    buildMenu().popup({ window: petWindow });
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => setPetVisible(true));
  app.whenReady().then(() => {
    loadSettings();
    registerIpc();
    createPetWindow();
    createTray();
    reminderTimer = setInterval(checkReminder, CHECK_INTERVAL_MS);
    checkReminder();
  });
}

app.on("activate", () => setPetVisible(true));
app.on("window-all-closed", () => {});
app.on("before-quit", () => {
  quitting = true;
  if (reminderTimer) clearInterval(reminderTimer);
});
