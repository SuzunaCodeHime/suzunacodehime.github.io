(function () {
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
    document.documentElement.setAttribute("data-theme", t === "night" ? "night" : "day");
})();
