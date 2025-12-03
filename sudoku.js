// MENU MOBILE
const menuBtn = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

menuBtn.onclick = () => {
    menu.classList.toggle("show");
};

// FECHAR MENU AO CLICAR EM LINK
document.querySelectorAll(".menu a").forEach(link => {
    link.onclick = () => menu.classList.remove("show");
});

// TEMA CLARO / ESCURO
const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
