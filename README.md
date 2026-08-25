<p align="center">
  <img src="./assets/img/SuzunaCodeHime.png" width="100" alt="SuzunaCodeHime" style="border-radius:50%">
</p>

<h1 align="center">SuzunaCodeHime の 作品集 ・ 和</h1>

<p align="center">
  <a href="https://suzunacodehime.github.io/">在线预览</a>
  ·
  <a href="#-功能特性">功能特性</a>
  ·
  <a href="#-快速开始">快速开始</a>
  ·
  <a href="#-自定义">自定义</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/纯前端-零依赖-brightgreen" alt="纯前端">
  <img src="https://img.shields.io/badge/许可证-MIT-blue" alt="MIT">
</p>

<p align="center">🌸 以代码为针，缝一段温柔的时光 —— 日式和风个人主页与作品集</p>

---

## ✨ 功能特性

- **🌙 夜樱深色模式** — 藏青夜空 × 月光白配色，日轮化银月，一键昼夜切换并记忆偏好
- **🌸 樱花飘落** — 十余片花瓣随机飘落摇摆，纯 CSS 实现
- **🏅 技能段位表** — 以「三段」「四段」和风段位呈现熟练度，朱红菱形计数
- **📜 一言随筆** — 竖排短册引言卡，随机治愈文案，可手动换一句
- **✨ 点击樱花特效** — 点击页面散落花瓣，触屏设备自动关闭
- **🧭 导航增强** — 滚动高亮当前区块，鸟居造型回到顶部按钮
- **🎨 和风视觉** — 宣纸纹理、朱印「鈴」、青海波页脚、汉字序号编排
- **🔖 favicon + SEO** — 朱印标签页图标、社交分享 OG 标签
- **🚧 自定义 404** — 「迷路了」和风 404 页面（GitHub Pages 自动生效）
- **♿ 细节关怀** — `prefers-reduced-motion` 降级动画、语义化标签、响应式布局

## 🛠 技术栈

| 技术 | 用途 |
|---|---|
| **HTML5** | 语义化结构 |
| **CSS3** | 独立样式表：CSS 变量双主题系统、`writing-mode` 竖排、`@keyframes` 动画、SVG data-URI 纹样、Flexbox/Grid 布局 |
| **JavaScript (ES6+)** | 独立脚本（theme.js 防闪烁初始化 + main.js 主逻辑）：主题持久化、`IntersectionObserver` 滚动侦测、Web Animations API 点击特效 |
| **字体** | 系统明朝体/宋体字栈（平成明朝、思源宋体等），零外部请求 |
| **部署** | GitHub Pages |

**零依赖** — 无框架、无第三方库、无构建步骤。

## 📁 目录结构

```
suzunacodehime.github.io/
├── index.html              # 主页（和风版）
├── 404.html                # 自定义 404 页面
├── assets/
│   ├── css/
│   │   └── style.css           # 主页全部样式（含昼夜双主题变量）
│   ├── js/
│   │   ├── theme.js            # 夜樱模式防闪烁初始化
│   │   └── main.js             # 全部交互逻辑
│   └── img/
│       └── SuzunaCodeHime.png  # 头像 / OG 分享图
├── projects/               # 作品文件（本地路径访问）
│   ├── Class-Attendance-System/  # 课堂点名系统
│   ├── 2048/                     # 2048 小游戏
│   ├── Tool_Box/                 # 工具箱
│   └── cyberpunk-site/           # 赛博朋克演示站
└── README.md
```

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/SuzunaCodeHime/suzunacodehime.github.io.git

# 进入目录
cd suzunacodehime.github.io

# 方式一：直接双击 index.html 打开
# 方式二：使用本地服务器
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 🎨 自定义

### 修改主题色

编辑 `assets/css/style.css` 中的 CSS 变量，昼间改 `:root`，夜间改 `html[data-theme="night"]`：

```css
:root {
    --paper: #f6f2e9;   /* 底色（宣纸） */
    --ink: #26324e;     /* 文字（藏青墨） */
    --shu: #cb4042;     /* 强调色（朱红） */
    --gold: #a3813f;    /* 点缀（金茶） */
}
```

### 调整技能段位

在「段位」区块修改 `.r-rank` 文字与菱形数量：

```html
<span class="pips"><i class="on"></i><i class="on"></i><i></i><i></i><i></i></span>
<span class="r-rank">二段</span>
```

### 编辑随筆词库

向 `assets/js/main.js` 中的 `quotes` 数组增删句子即可。

### 增删作品

1. 将作品文件放入 `projects/<作品名>/`，入口命名为 `index.html`
2. 在「作品」区块按「壱弐参肆」序号模板添加 `<li>`

### 更换分享图

替换 `assets/img/SuzunaCodeHime.png`，或同步修改 `<meta property="og:image">` 的绝对地址。

## 🌐 部署

本项目为 GitHub Pages 站点，推送到默认分支即可自动部署：

```bash
git add .
git commit -m "update"
git push
```

访问 `https://suzunacodehime.github.io/` 查看效果。

## 📄 许可证

本项目基于 MIT 许可证开源。
