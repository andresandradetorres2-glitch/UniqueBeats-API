// ================================
// CATALOGO DE BEATS
// Conectado al Backend Real
// ================================

// Objeto global para controlar el audio actual
const audioPlayer = {
    currentAudio: null,
    currentBeatId: null,
    isPlaying: false
};

document.addEventListener("DOMContentLoaded", () => {
    prepararFiltrosCatalogo();
    cargarBeatsDesdeAPI();
    configurarModal();
    actualizarMenuSesion();
});

async function cargarBeatsDesdeAPI() {
    const contenedor = document.getElementById("beatsCatalog");
    if (!contenedor) return;

    // Estado de carga
    contenedor.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: white;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #00ffff;"></i>
            <p style="margin-top: 1rem; font-size: 1.2rem;">Cargando beats... 💎</p>
        </div>
    `;

    try {
        const respuesta = await fetch("http://localhost:3002/api/beats");

        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el servidor de beats.");
        }

        const beats = await respuesta.json();

        if (beats.length === 0) {
            contenedor.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: white;">
                    <i class="fas fa-music-slash" style="font-size: 3rem; color: #555;"></i>
                    <p style="margin-top: 1rem; font-size: 1.2rem;">No hay beats disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        // Renderizar los beats reales
        contenedor.innerHTML = beats.map(beat => crearBeatCard(beat)).join("");

    } catch (error) {
        console.error("Error cargando catálogo:", error);
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: white;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff4444;"></i>
                <p style="margin-top: 1rem; font-size: 1.2rem;">Error al cargar los beats. Por favor, intenta más tarde.</p>
                <button onclick="cargarBeatsDesdeAPI()" class="btn btn-primary" style="margin-top: 1rem; cursor: pointer; padding: 10px 20px;">Reintentar</button>
            </div>
        `;
    }
}

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
    const genero = obtenerValor("filter-genre").toLowerCase();
    const bpm = obtenerValor("filter-bpm");
    const licencia = obtenerValor("filter-license").toLowerCase();
    const precioMaximo = Number(obtenerValor("filter-price"));
    const cards = document.querySelectorAll(".beat-card");

    cards.forEach((card) => {
        const texto = card.textContent.toLowerCase();
        const precio = extraerPrecio(card);

        // 1. Buscar por nombre
        const coincideNombre = !busqueda || texto.includes(busqueda);

        // 2. Filtrar por género (comparación flexible)
        const coincideGenero = !genero || texto.includes(genero);

        // 3. Filtrar por licencia (comparación flexible)
        const coincideLicencia = !licencia || texto.includes(licencia);

        // 4. Filtrar por precio máximo
        const coincidePrecio = !precioMaximo || precio <= precioMaximo;

        // 5. Filtrar por rango de BPM
        const coincideBpm = !bpm || coincideRangoBpm(texto, bpm);

        card.style.display = coincideNombre && coincideGenero && coincideLicencia && coincidePrecio && coincideBpm
            ? ""
            : "none";
    });

    // Mensaje de "No hay coincidencias"
    const contenedor = document.getElementById("beatsCatalog");
    const beatsVisibles = Array.from(cards).filter(card => card.style.display !== "none");

    if (beatsVisibles.length === 0) {
        // Para no borrar el contenido original, podemos añadir un mensaje temporal o manejarlo mediante un contenedor
        // Pero la implementación actual borra el contenido al cargar.
        // Lo más limpio es añadir un mensaje al final si no hay resultados.
        if (!document.getElementById("no-results-msg")) {
            const msg = document.createElement("div");
            msg.id = "no-results-msg";
            msg.style = "grid-column: 1/-1; text-align: center; padding: 3rem; color: white;";
            msg.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; color: #555; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.2rem;">No encontramos ningún beat que coincida con tus filtros. 💎</p>
                <button onclick="limpiarFiltros()" class="btn btn-primary" style="margin-top: 1rem; cursor: pointer; padding: 10px 20px;">Limpiar Filtros</button>
            `;
            contenedor.appendChild(msg);
        }
    } else {
        const msg = document.getElementById("no-results-msg");
        if (msg) msg.remove();
    }
}

function limpiarFiltros() {
    document.getElementById("search-beat").value = "";
    document.getElementById("filter-genre").value = "";
    document.getElementById("filter-bpm").value = "";
    document.getElementById("filter-license").value = "";
    document.getElementById("filter-price").value = "";
    filtrarCardsExistentes();
}

function crearBeatCard(beat) {
    const titulo = beat.titulo || "Sin título";
    const genero = beat.genero || "N/A";
    const bpm = beat.bpm || "0";
    const tonalidad = beat.tonalidad || "N/A";
    const licencia = beat.licencia || "No especificada";
    const precio = beat.precio ? parseFloat(beat.precio).toFixed(2) : "0.00";

    const infoVisual = obtenerInfoVisual(genero);
    const beatData = btoa(unescape(encodeURIComponent(JSON.stringify(beat))));

    return `
        <article class="beat-card" id="beat-${beat.id}">
            <div class="beat-image">
                ${beat.miniatura_url
                    ? `<img src="${beat.miniatura_url}" alt="${titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.src='assets/img/placeholder-beat.jpg';">`
                    : `<i class="fas fa-${infoVisual.icono}" style="font-size: 4rem; color: var(--accent-color, #00ffff);"></i>`
                }
                <span class="beat-tag">${infoVisual.etiqueta}</span>
            </div>
            <div id="player-container-${beat.id}" style="display: none;"></div>
            <div class="beat-info">
                <h3>${titulo}</h3>
                <p><strong>Genero:</strong> ${genero} | <strong>BPM:</strong> ${bpm} | <strong>Tonalidad:</strong> ${tonalidad}</p>
                <p><strong>Licencia:</strong> ${licencia}</p>
                <span class="beat-price">$${precio} <span style="font-size: 0.8rem; opacity: 0.7;">USD</span></span>
                <div class="beat-actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1rem;">
                    <button onclick="togglePlayBeat(${beat.id}, '${beat.audio_preview_url || ''}')" class="btn-beat btn-buy" title="Reproducir/Pausar" id="play-btn-${beat.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <a href="#" class="btn-beat btn-buy" title="Agregar al carrito"><i class="fas fa-shopping-cart"></i></a>
                    <a href="javascript:void(0)" onclick="abrirDetallesBeat('${beatData}')" class="btn-beat btn-buy" title="Ver detalles"><i class="fas fa-info-circle"></i></a>
                </div>
            </div>
        </article>
    `;
}

function obtenerInfoVisual(genero) {
    const map = {
        "Trap": { icono: "fire", etiqueta: "Hot" },
        "Lo-Fi": { icono: "cloud", etiqueta: "Chill" },
        "Synthwave": { icono: "compact-disc", etiqueta: "Retro" },
        "Reggaetón": { icono: "wave-square", etiqueta: "Urban" },
        "Boom Bap": { icono: "drum", etiqueta: "Classic" },
        "R&B": { icono: "heart", etiqueta: "Smooth" },
        "Drill": { icono: "bolt", etiqueta: "Hard" }
    };
    return map[genero] || { icono: "music", etiqueta: "Beat" };
}

// ======================================================
// LÓGICA DEL REPRODUCTOR DE AUDIO
// ======================================================

function actualizarMenuSesion() {
    const sesion = localStorage.getItem('usuario');
    if (!sesion) return;

    try {
        const usuario = JSON.parse(sesion);
        const adminPanelLink = document.getElementById('adminPanelLink');
        const accountLink = document.getElementById('accountLink');

        if (adminPanelLink && usuario.tipo === 'admin') {
            adminPanelLink.style.display = 'block';
        }

        if (accountLink) {
            accountLink.textContent = 'Cerrar sesión';
            accountLink.href = '#';
            accountLink.onclick = (event) => {
                event.preventDefault();
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
            };
        }
    } catch (error) {
        console.error('Error actualizando menú de sesión:', error);
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateProgressBar(beatId) {
    const audio = audioPlayer.currentAudio;
    if (!audio || audioPlayer.currentBeatId !== beatId) return;

    const progressFill = document.getElementById(`progress-fill-${beatId}`);
    const timeCurrent = document.getElementById(`time-current-${beatId}`);
    const timeTotal = document.getElementById(`time-total-${beatId}`);

    if (progressFill) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
    }
    if (timeCurrent) {
        timeCurrent.textContent = formatTime(audio.currentTime);
    }
    if (timeTotal && !isNaN(audio.duration)) {
        timeTotal.textContent = formatTime(audio.duration);
    }
}

function seekAudio(beatId, percent) {
    if (audioPlayer.currentAudio && audioPlayer.currentBeatId === beatId) {
        const newTime = (percent / 100) * audioPlayer.currentAudio.duration;
        audioPlayer.currentAudio.currentTime = newTime;
    }
}

function togglePlayBeat(beatId, audioUrl) {
    if (!audioUrl) {
        alert("Este beat no tiene un audio de vista previa disponible.");
        return;
    }

    if (audioPlayer.currentBeatId === beatId) {
        if (audioPlayer.isPlaying) {
            audioPlayer.currentAudio.pause();
            audioPlayer.isPlaying = false;
            actualizarIconoPlay(beatId, "fa-play");
            // El reproductor ya NO se oculta aquí para mejorar la UX
        } else {
            audioPlayer.currentAudio.play();
            audioPlayer.isPlaying = true;
            actualizarIconoPlay(beatId, "fa-pause");
        }
        return;
    }

    if (audioPlayer.currentAudio) {
        audioPlayer.currentAudio.pause();
        actualizarIconoPlay(audioPlayer.currentBeatId, "fa-play");
        ocultarMiniReproductor(audioPlayer.currentBeatId);
    }

    const audio = new Audio(audioUrl);

    audio.play();

    audio.ontimeupdate = () => updateProgressBar(beatId);
    audio.onended = () => {
        audioPlayer.isPlaying = false;
        actualizarIconoPlay(beatId, "fa-play");
        ocultarMiniReproductor(beatId);
    };

    audioPlayer.currentAudio = audio;
    audioPlayer.currentBeatId = beatId;
    audioPlayer.isPlaying = true;

    actualizarIconoPlay(beatId, "fa-pause");
    mostrarMiniReproductor(beatId, audioUrl);
}

function mostrarMiniReproductor(beatId, audioUrl) {
    const container = document.getElementById(`player-container-${beatId}`);
    if (!container) return;

    container.innerHTML = `
        <div class="mini-player">
            <div class="player-progress-row">
                <span id="time-current-${beatId}" class="time-label">${formatTime(audioPlayer.currentAudio ? audioPlayer.currentAudio.currentTime : 0)}</span>
                <div class="progress-bar-bg"
                     onclick="handleProgressClick(event, ${beatId})"
                     onmousemove="showTooltip(event, ${beatId})"
                     onmouseout="hideTooltip(${beatId})">
                    <div class="progress-bar-fill" id="progress-fill-${beatId}"></div>
                    <div id="tooltip-${beatId}" class="progress-tooltip">0:00</div>
                </div>
                <span id="time-total-${beatId}" class="time-label">${formatTime(audioPlayer.currentAudio ? audioPlayer.currentAudio.duration : 0)}</span>
            </div>
            <div class="player-controls-row">
                <button onclick="togglePlayBeat(${beatId}, '${audioUrl}')" class="player-btn main-play" id="mini-play-btn-${beatId}">
                    <i class="fas ${audioPlayer.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </button>
                <div class="volume-group">
                    <button onclick="toggleMute(${beatId})" class="player-btn volume-btn" id="mute-btn-${beatId}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <input type="range" min="0" max="1" step="0.05" value="1"
                           oninput="setVolume(${beatId}, this.value)"
                           class="volume-slider-horizontal">
                </div>
            </div>
        </div>
    `;
    container.style.display = "block";
}

function ocultarMiniReproductor(beatId) {
    const container = document.getElementById(`player-container-${beatId}`);
    if (container) {
        container.style.display = "none";
        container.innerHTML = "";
    }
}

function handleProgressClick(event, beatId) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = (x / width) * 100;
    seekAudio(beatId, percent);
}

function seekAudioRelative(beatId, delta) {
    if (audioPlayer.currentAudio && audioPlayer.currentBeatId === beatId) {
        audioPlayer.currentAudio.currentTime += delta;
    }
}

function setVolume(beatId, value) {
    if (audioPlayer.currentAudio && audioPlayer.currentBeatId === beatId) {
        audioPlayer.currentAudio.volume = value;
    }
}

function toggleMute(beatId) {
    if (audioPlayer.currentAudio && audioPlayer.currentBeatId === beatId) {
        const audio = audioPlayer.currentAudio;
        audio.muted = !audio.muted;
        const btn = document.getElementById(`mute-btn-${beatId}`);
        if (btn) {
            btn.querySelector('i').className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
    }
}

function showTooltip(event, beatId) {
    if (!audioPlayer.currentAudio || audioPlayer.currentBeatId !== beatId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = x / width;
    const time = percent * audioPlayer.currentAudio.duration;

    const tooltip = document.getElementById(`tooltip-${beatId}`);
    if (tooltip) {
        tooltip.textContent = formatTime(time);
        tooltip.style.left = `${(percent * 100) - 2}%`;
        tooltip.style.display = "block";
    }
}

function hideTooltip(beatId) {
    const tooltip = document.getElementById(`tooltip-${beatId}`);
    if (tooltip) tooltip.style.display = "none";
}

function actualizarIconoPlay(beatId, icono) {
    const btn = document.getElementById(`play-btn-${beatId}`);
    if (btn) {
        const i = btn.querySelector('i');
        if (i) {
            i.className = `fas ${icono}`;
        }
    }
}

function abrirDetallesBeat(base64Beat) {
    try {
        const beat = JSON.parse(decodeURIComponent(escape(atob(base64Beat))));
        const modal = document.getElementById("beatModal");
        const modalBody = document.getElementById("modalBody");

        if (!modal || !modalBody) return;

        const titulo = beat.titulo || "Sin título";
        const genero = beat.genero || "N/A";
        const bpm = beat.bpm || "0";
        const tonalidad = beat.tonalidad || "N/A";
        const licencia = beat.licencia || "No especificada";
        const precio = beat.precio ? parseFloat(beat.precio).toFixed(2) : "0.00";
        const moneda = beat.moneda || "USD";
        const estado = beat.estado || "No especificado";
        const descripcion = beat.descripcion || "Sin descripción disponible.";

        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 class="section-title" style="font-size: 2rem; margin-bottom: 0.5rem;">${titulo}</h2>
                <span class="beat-tag" style="font-size: 0.9rem; padding: 5px 15px; border-radius: 20px; background: rgba(0,255,255,0.1); color: #00ffff; border: 1px solid #00ffff;">${estado.toUpperCase()}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; font-size: 1.1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    <p><strong style="color: #00ffff;">Género:</strong> ${genero}</p>
                    <p><strong style="color: #00ffff;">BPM:</strong> ${bpm}</p>
                    <p><strong style="color: #00ffff;">Tonalidad:</strong> ${tonalidad}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    <p><strong style="color: #00ffff;">Licencia:</strong> ${licencia}</p>
                    <p><strong style="color: #00ffff;">Precio:</strong> ${precio} ${moneda}</p>
                    <p><strong style="color: #00ffff;">Estado:</strong> ${estado}</p>
                </div>
            </div>

            <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(0,0,0,0.3); border-radius: 15px; border-left: 4px solid #00ffff;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.8rem; color: #00ffff;"><i class="fas fa-align-left"></i> Descripción</h3>
                <p style="line-height: 1.6; color: #ccc; font-style: italic;">"${descripcion}"</p>
            </div>

            <div style="text-align: center; display: flex; justify-content: center; gap: 15px;">
                ${beat.audio_preview_url ? `
                    <button onclick="togglePlayBeat(${beat.id}, '${beat.audio_preview_url}')" class="btn btn-primary" style="padding: 12px 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; font-weight: bold;">
                        <i class="fas fa-play"></i> Reproducir Preview
                    </button>
                ` : ''}
                ${beat.youtube_url ? `
                    <a href="${beat.youtube_url}" target="_blank" class="btn btn-primary" style="padding: 12px 20px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-weight: bold; cursor: pointer;">
                        <i class="fab fa-youtube"></i> Ver en YouTube
                    </a>
                ` : ''}
            </div>
        `;

        modal.style.display = "flex";
    } catch (error) {
        console.error("Error al abrir detalles del beat:", error);
    }
}

function cerrarModal() {
    const modal = document.getElementById("beatModal");
    if (modal) modal.style.display = "none";
}

function configurarModal() {
    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("beatModal");

    if (closeBtn) {
        closeBtn.addEventListener("click", cerrarModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                cerrarModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
                cerrarModal();
            }
    });
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
    const resultado = texto.match(/bpm:\s*(\d+)/);
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
