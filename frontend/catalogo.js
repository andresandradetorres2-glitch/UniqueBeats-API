// ================================
// CATALOGO DE BEATS
// Base temporal hasta conectar backend
// ================================

const beatsDemo = [
    {
        nombre: "Midnight City",
        genero: "synthwave",
        bpm: 110,
        tonalidad: "Do m",
        licencia: "premium",
        precio: 29.99,
        etiqueta: "Popular",
        icono: "compact-disc"
    },
    {
        nombre: "Cloudy Days",
        genero: "lofi",
        bpm: 85,
        tonalidad: "Fa maj",
        licencia: "basic",
        precio: 19.99,
        etiqueta: "Lo-Fi",
        icono: "cloud"
    },
    {
        nombre: "Street Heat",
        genero: "trap",
        bpm: 140,
        tonalidad: "Sol m",
        licencia: "exclusive",
        precio: 99.99,
        etiqueta: "Hot",
        icono: "fire"
    },
    {
        nombre: "Neon Nights",
        genero: "reggaeton",
        bpm: 95,
        tonalidad: "Re m",
        licencia: "premium",
        precio: 34.99,
        etiqueta: "Urban",
        icono: "wave-square"
    },
    {
        nombre: "Silent Echo",
        genero: "lofi",
        bpm: 78,
        tonalidad: "La m",
        licencia: "basic",
        precio: 14.99,
        etiqueta: "Deep",
        icono: "moon"
    },
    {
        nombre: "Thunder Strike",
        genero: "trap",
        bpm: 155,
        tonalidad: "Mi m",
        licencia: "exclusive",
        precio: 120,
        etiqueta: "Exclusive",
        icono: "bolt"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    prepararFiltrosCatalogo();
    renderizarCatalogoDemoSiExiste();
});

function prepararFiltrosCatalogo() {
    const formulario = document.querySelector(".filter-container");

    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();
        filtrarCardsExistentes();
    });
}

function filtrarCardsExistentes() {
    const busqueda = obtenerValor("search-beat").toLowerCase();
    const genero = obtenerValor("filter-genre");
    const bpm = obtenerValor("filter-bpm");
    const licencia = obtenerValor("filter-license");
    const precioMaximo = Number(obtenerValor("filter-price"));
    const cards = document.querySelectorAll(".beat-card");

    cards.forEach((card) => {
        const texto = card.textContent.toLowerCase();
        const precio = extraerPrecio(card);
        const coincideNombre = !busqueda || texto.includes(busqueda);
        const coincideGenero = !genero || texto.includes(normalizarTexto(genero));
        const coincideLicencia = !licencia || texto.includes(normalizarTexto(licencia));
        const coincidePrecio = !precioMaximo || precio <= precioMaximo;
        const coincideBpm = !bpm || coincideRangoBpm(texto, bpm);

        card.style.display = coincideNombre && coincideGenero && coincideLicencia && coincidePrecio && coincideBpm
            ? ""
            : "none";
    });
}

function renderizarCatalogoDemoSiExiste() {
    const contenedor = document.getElementById("beatsCatalog");

    if (!contenedor) return;

    contenedor.innerHTML = beatsDemo.map(crearBeatCard).join("");
}

function crearBeatCard(beat) {
    return `
        <article class="beat-card">
            <div class="beat-image">
                <i class="fas fa-${beat.icono}" style="font-size: 4rem; color: var(--accent-color, #00ffff);"></i>
                <span class="beat-tag">${beat.etiqueta}</span>
            </div>
            <div class="beat-info">
                <h3>${beat.nombre}</h3>
                <p><strong>Genero:</strong> ${beat.genero} | <strong>BPM:</strong> ${beat.bpm} | <strong>Tonalidad:</strong> ${beat.tonalidad}</p>
                <p><strong>Licencia:</strong> ${beat.licencia}</p>
                <span class="beat-price">$${beat.precio.toFixed(2)} <span style="font-size: 0.8rem; opacity: 0.7;">USD</span></span>
                <div class="beat-actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1rem;">
                    <a href="#" class="btn-beat btn-buy" title="Escuchar"><i class="fas fa-play"></i></a>
                    <a href="#" class="btn-beat btn-buy" title="Agregar al carrito"><i class="fas fa-shopping-cart"></i></a>
                    <a href="#" class="btn-beat btn-buy" title="Ver detalles"><i class="fas fa-info-circle"></i></a>
                </div>
            </div>
        </article>
    `;
}

function obtenerValor(id) {
    const elemento = document.getElementById(id);
    return elemento ? elemento.value.trim() : "";
}

function normalizarTexto(texto) {
    const equivalencias = {
        basic: "basica",
        premium: "premium",
        exclusive: "exclusiva",
        lofi: "lo-fi",
        reggaeton: "reggaeton",
        boombap: "boom bap",
        rnb: "r&b",
        electro: "electronic"
    };

    return equivalencias[texto] || texto;
}

function coincideRangoBpm(texto, rango) {
    const resultado = texto.match(/bpm:\s*(\d+)/i);
    const bpm = resultado ? Number(resultado[1]) : 0;

    if (!bpm) return true;
    if (rango === "slow") return bpm >= 60 && bpm <= 90;
    if (rango === "mid") return bpm >= 91 && bpm <= 120;
    if (rango === "fast") return bpm >= 121;

    return true;
}

function extraerPrecio(card) {
    const texto = card.textContent;
    const resultado = texto.match(/\$(\d+(?:\.\d+)?)/);
    return resultado ? Number(resultado[1]) : 0;
}
