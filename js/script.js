// 1. 实时时间
function getTime() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][d.getDay()];
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    document.getElementById("nowTime").innerText = `${y}年${m}月${day}日 ${week} ${h}:${min}:${s}`;
}
setInterval(getTime, 1000);
getTime();

// 2. 欢迎打字文字（带光标）
const welcome = "欢迎来到我的作品集 ✨";
let wIndex = 0;
const welcomeDom = document.getElementById("welcomeText");

function showWelcome() {
    if (wIndex < welcome.length) {
        welcomeDom.innerHTML = welcome.substring(0, wIndex + 1) + '<span class="cursor"></span>';
        wIndex++;
        setTimeout(showWelcome, 120);
    } else {
        welcomeDom.innerHTML = welcome + '<span class="cursor"></span>';
    }
}

setTimeout(showWelcome, 500);

// 3. 导航栏显示/隐藏
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        navbar.classList.add('visible');
    } else {
        navbar.classList.remove('visible');
    }
});

// 4. 回到顶部
const topBtn = document.getElementById("toTop");
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        topBtn.classList.add('show');
    } else {
        topBtn.classList.remove('show');
    }
});

topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// 5. 滚动显现动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // 技能条动画
            const skillFills = entry.target.querySelectorAll('.skill-fill');
            skillFills.forEach(fill => {
                const width = fill.getAttribute('data-width');
                setTimeout(() => {
                    fill.style.width = width + '%';
                }, 300);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('.box').forEach(box => {
    observer.observe(box);
});

// 6. 主题切换
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// 检查本地存储
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '☀' : '☾';
}

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.innerHTML = next === 'dark' ? '☀' : '☾';
});

// 7. 背景粒子生成
const particlesContainer = document.getElementById('particles');
const particleCount = 20;

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    const size = Math.random() * 4 + 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particlesContainer.appendChild(particle);
}

// 8. 平滑滚动锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});