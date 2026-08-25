const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
    const isNight = theme === "night";
    root.setAttribute("data-theme", isNight ? "night" : "day");
    localStorage.setItem("site-theme", theme);
    themeBtn.textContent = isNight ? "☀" : "☾";
    themeBtn.title = isNight ? "回到白昼" : "切换夜樱";
}

applyTheme(localStorage.getItem("site-theme") || root.getAttribute("data-theme") || "day");

themeBtn.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "night" ? "day" : "night");
});

window.addEventListener("storage", (e) => {
    if (e.key === "site-theme" && e.newValue) {
        applyTheme(e.newValue);
    }
});

const quotes = [
    "不必迎合所有人，安稳自在便是最好。",
    "好好生活，慢慢相遇，好好爱身边值得的人。",
    "慢慢来，比较快。",
    "你走的每一步，都算数。",
    "生活明朗，万物可爱。",
    "保持热爱，奔赴山海。",
    "别慌，月亮也正在大海某处迷茫。",
    "一点点变好，就是最好的状态。",
    "把日子过成诗，把代码写成歌。",
    "认真生活的人，运气都不会太差。"
];

const quoteEl = document.getElementById("quoteText");
const quoteBtn = document.getElementById("quoteRefresh");
let quoteIndex = Math.floor(Math.random() * quotes.length);

function renderQuote() {
    quoteEl.textContent = quotes[quoteIndex];
}

function switchQuote() {
    quoteEl.classList.add("switching");
    setTimeout(() => {
        quoteIndex = (quoteIndex + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length;
        renderQuote();
        quoteEl.classList.remove("switching");
    }, 350);
}

renderQuote();
quoteBtn.addEventListener("click", switchQuote);

const navLinks = document.querySelectorAll('.top-nav a[href^="#"]');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute("href")));

const spy = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
            }
        });
    },
    { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((s) => s && spy.observe(s));

const torii = document.getElementById("torii");

window.addEventListener(
    "scroll",
    () => torii.classList.toggle("show", window.scrollY > 300),
    { passive: true }
);

torii.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

const isTouch = window.matchMedia("(pointer: coarse)").matches;

if (!reducedMotion && !isTouch) {
    document.addEventListener("click", (e) => {
        for (let i = 0; i < 6; i++) {
            const s = document.createElement("span");
            s.className = "burst";
            const size = 8 + Math.random() * 6;
            s.style.width = size + "px";
            s.style.height = size + "px";
            s.style.left = e.clientX + "px";
            s.style.top = e.clientY + "px";
            document.body.appendChild(s);

            const dx = (Math.random() - 0.5) * 90;
            const dy = 20 + Math.random() * 55;

            s.animate(
                [
                    { opacity: 1, transform: "translate(-50%, -50%) rotate(0deg)" },
                    { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${140 + Math.random() * 260}deg)` }
                ],
                { duration: 700 + Math.random() * 400, easing: "ease-out" }
            ).onfinish = () => s.remove();
        }
    });
}
