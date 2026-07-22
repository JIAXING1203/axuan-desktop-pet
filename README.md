# 阿璇桌宠 / Axuan Desktop Pet

一个完全独立、可拖动、会随机做可爱动作，并在工作日提醒你喝水的跨平台桌宠。

![阿璇动作预览](assets/preview.gif)

## 功能

- 支持 macOS、Windows 和 Linux
- 透明、置顶、无边框桌宠窗口
- 拖动时根据方向播放左右移动动作
- 单击随机播放挥手或跳舞，同一触发条件会出现不同效果
- 每隔 45–90 秒随机做一次可爱动作
- 工作日 10:00–22:00 每个整点提醒：`阿璇提醒你：快去喝水和活动！！`
- 提醒时显示气泡并播放专属催促动作
- 托盘菜单支持显示/隐藏、开关提醒、测试提醒和开机启动
- 所有判断均在本机完成，不收集或上传任何数据

## 快速开始

需要安装 [Node.js](https://nodejs.org/) 20 或更高版本以及 Git。

```bash
git clone https://github.com/JIAXING1203/axuan-desktop-pet.git
cd axuan-desktop-pet
npm install
npm start
```

## 操作

- 拖动阿璇：移动桌宠位置
- 单击阿璇：随机播放挥手或跳舞
- 右键阿璇：打开功能菜单
- 单击系统托盘图标：显示或隐藏桌宠
- 托盘菜单中的“测试喝水提醒”：立即预览提醒和催促动作

## 测试与打包

```bash
npm test
npm run pack
npm run dist
```

打包产物会生成在 `dist/`。GitHub Actions 也会在每次推送后分别构建 macOS、Windows 和 Linux 版本。

macOS 第一次运行未签名的本地构建时，可能需要在“系统设置 → 隐私与安全性”中确认打开。公开分发时建议配置 Apple Developer 签名和公证。

## 自定义提醒

默认提醒配置位于 [`src/reminder.js`](src/reminder.js)。修改工作时段或文案后重新启动即可生效。

## 项目结构

```text
assets/              桌宠精灵图、图标和预览
src/main.js          独立窗口、托盘和系统通知
src/renderer.js      动画、拖动和随机动作
src/reminder.js      本地提醒规则
tests/               提醒与动画协议测试
.github/workflows/   多平台持续构建
```

## 许可

代码和本项目包含的桌宠资源均以 [MIT License](LICENSE) 发布。
