(function () {
    "use strict";

    var root = document.documentElement;
    var KEY = "site-theme";

    var t = localStorage.getItem(KEY);
    if (!t) {
        t = localStorage.getItem("v2-theme") || localStorage.getItem("tb-theme") || "day";
        if (t !== "day") {
            try { localStorage.setItem(KEY, t); } catch (e) {}
        }
    }
    try {
        localStorage.removeItem("v2-theme");
        localStorage.removeItem("tb-theme");
    } catch (e) {}

    root.setAttribute("data-theme", t === "night" ? "night" : "day");

    function inject() {
        var btn = document.createElement("button");
        btn.id = "tbThemeBtn";
        btn.type = "button";
        btn.setAttribute("aria-label", "切换昼夜模式");
        btn.style.cssText = [
            "position:fixed", "right:16px", "bottom:64px",
            "width:38px", "height:38px", "border-radius:50%",
            "border:1px solid var(--border)", "background:var(--bg2)", "color:var(--text)",
            "font-size:16px", "line-height:1", "cursor:pointer", "z-index:9999",
            "box-shadow:0 4px 14px rgba(120,80,95,.18)",
            "transition:transform .3s ease,border-color .2s ease,color .2s ease"
        ].join(";");
        if (btn.style.setProperty) btn.style.setProperty("font-family", "inherit");

        function paint() {
            var night = root.getAttribute("data-theme") === "night";
            btn.textContent = night ? "\u2600" : "\u263e";
            btn.title = night ? "回到白昼" : "切换夜色";
        }

        btn.addEventListener("click", function () {
            var night = root.getAttribute("data-theme") === "night";
            root.setAttribute("data-theme", night ? "day" : "night");
            localStorage.setItem(KEY, night ? "day" : "night");
            paint();
        });
        btn.addEventListener("mouseenter", function () { btn.style.transform = "translateY(-3px)"; });
        btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });

        window.addEventListener("storage", function (e) {
            if (e.key === KEY && e.newValue) {
                root.setAttribute("data-theme", e.newValue);
                paint();
            }
        });

        paint();
        document.body.appendChild(btn);
    }

    if (document.body) {
        inject();
    } else {
        document.addEventListener("DOMContentLoaded", inject);
    }
})();
