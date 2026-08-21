<p align="center">
  <img src="./img/SuzunaCodeHime.png" width="100" alt="SuzunaCodeHime" style="border-radius:50%">
</p>

<h1 align="center">SuzunaCodeHime の 作品集</h1>

<p align="center">
  <a href="https://suzunacodehime.github.io/">在线预览</a>
  ·
  <a href="#features">功能特性</a>
  ·
  <a href="#快速开始">快速开始</a>
  ·
  <a href="#自定义">自定义</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/纯前端-无依赖-brightgreen" alt="纯前端">
  <img src="https://img.shields.io/badge/许可证-MIT-blue" alt="MIT">
</p>

<p align="center">🌸 用代码编织温柔的作品集 · 07 年前端学习者个人主页</p>

---

## ✨ 功能特性

- **🌓 明暗主题切换** — 点击导航栏月亮/太阳图标，自动保存偏好到 localStorage
- **🌌 极光光晕背景** — 动态 CSS 极光光斑，随窗口变化缓慢流动
- **✨ 浮动粒子效果** — 随机生成 20 个漂浮粒子，轻盈点缀
- **⌨️ 打字机欢迎语** — 进入页面后逐字浮现「欢迎来到我的作品集 ✨」
- **🕐 实时时钟** — 显示当前日期、星期、时分秒，每秒更新
- **📜 滚动显现动画** — 区域进入视口时淡入上浮，技能条同步填充
- **🎯 平滑滚动锚点** — 导航栏点击、滚动到对应区域
- **⬆️ 回到顶部** — 滚动超过 300px 后出现，一键平滑返回
- **📱 响应式布局** — 适配手机、平板、桌面端
- **🥽 毛玻璃效果** — 卡片、导航栏采用玻璃态设计，通透柔和

## 🛠 技术栈

| 技术 | 用途 |
|---|---|
| **HTML5** | 语义化结构 |
| **CSS3** | Flexbox 布局、CSS 变量主题系统、`@keyframes` 动画、毛玻璃 (`backdrop-filter`)、`linear-gradient` 渐变、`Intersection Observer` 配合滚动动画 |
| **JavaScript (ES6+)** | DOM 操作、事件监听、`IntersectionObserver` API、`localStorage` 主题持久化、定时器、随机粒子生成 |
| **字体** | Google Fonts 预加载 + 回退字体栈 (`PingFang SC` / `Microsoft YaHei`) |
| **部署** | GitHub Pages |

**零依赖** — 纯手写，未使用任何框架或第三方库。

## 📁 目录结构

```
suzunacodehime.github.io/
├── index.html          # 主页
├── css/
│   └── style.css       # 全部样式（含明暗主题变量）
├── js/
│   └── script.js       # 全部交互逻辑
├── img/
│   └── SuzunaCodeHime.png  # 头像
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

编辑 `css/style.css` 中的 `:root` 变量：

```css
:root {
  --primary: #e8688a;       /* 主色调 */
  --primary-light: #ff8fa3; /* 浅色 */
  --primary-dark: #c74b6e;  /* 深色 */
  --bg: #fdf2f5;            /* 背景色 */
}
```

### 修改技能值

在 `index.html` 中调整 `data-width` 属性：

```html
<div class="skill-fill" data-width="85"></div>
```

### 增删作品卡片

在 `index.html` 的 `#projects` 区域按模板添加或删除 `<a class="project-card">` 即可。

### 替换头像

将新的图片文件放入 `img/` 目录，更新 `index.html` 中 `<img>` 的 `src` 路径。

## 🌐 部署

本项目设计为 GitHub Pages 站点，推送到 `main` 分支即可自动部署：

```bash
git add .
git commit -m "update"
git push
```

访问 `https://suzunacodehime.github.io/` 查看效果。

## 📄 许可证

本项目基于 MIT 许可证开源。