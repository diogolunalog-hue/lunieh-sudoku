/* ===============================
   MENU MOBILE
================================ */

function toggleMenu() {
    const menu = document.getElementById("menu-mobile");
    menu.classList.toggle("aberto");
}

/* Fechar o menu quando clicar fora */
document.addEventListener("click", function (e) {
    const menu = document.getElementById("menu-mobile");
    const btn = document.querySelector(".menu-mobile-btn");

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove("aberto");
    }
});

/* ===============================
   MODO ESCURO (opcional)
   – pode integrar depois ao header
================================ */

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("modo-escuro", document.body.classList.contains("dark"));
}

/* Carregar modo escuro salvo */
window.addEventListener("load", () => {
    const ativado = localStorage.getItem("modo-escuro") === "true";
    if (ativado) document.body.classList.add("dark");
});

/* ===============================
   RASTREAMENTO DE NAVEGAÇÃO
   (pode ajudar no SEO e AdSense)
================================ */

function trackPageView() {
    console.log("Página visualizada:", window.location.pathname);
}

trackPageView();

/* ===============================
   FUNÇÕES COMUNS
================================ */

/* Rolar até o topo sem travar */
function scrollTopSmooth() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
