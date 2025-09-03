async function loadData() {
  const response = await fetch("data/combos.yml");
  const text = await response.text();
  const data = jsyaml.load(text);

  // Render combos
  const combosDiv = document.getElementById("comboCarousel");
  data.combos.forEach((combo, i) => {
    const div = document.createElement("div");
    div.className = "card combo";
    div.setAttribute("data-aos", i % 2 === 0 ? "fade-right" : "fade-left");
    div.innerHTML = `
      <img src="${combo.imagen}" alt="${combo.nombre}">
      <h3>${combo.nombre}</h3>
      <p>${combo.descripcion}</p>
      <strong>Precio: $${combo.precio}</strong>
    `;
    combosDiv.appendChild(div);
  });

  // Render trabajos
  const trabajosDiv = document.getElementById("proyectosCarousel");
  data.trabajos.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "card trabajo";
    div.setAttribute("data-aos", i % 2 === 0 ? "flip-left" : "flip-right");
    div.innerHTML = `
      <img src="${t.imagen}" alt="${t.titulo}">
      <p>${t.titulo}</p>
    `;
    trabajosDiv.appendChild(div);
  });
}

// Dark mode
const toggle = document.getElementById("themeToggle");
const html = document.documentElement;

toggle.addEventListener("click", () => {
  html.classList.toggle("dark");
  toggle.textContent = html.classList.contains("dark") ? "☀️" : "🌙";
});

// --- Autoplay Carousels ---
function autoScrollCarousel(id, interval = 4000) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  let scrollAmount = 0;
  setInterval(() => {
    const cardWidth = carousel.querySelector("div").offsetWidth + 24;
    if (scrollAmount + carousel.offsetWidth >= carousel.scrollWidth) {
      scrollAmount = 0;
    } else {
      scrollAmount += cardWidth;
    }
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, interval);
}

// Manual movement
function moveCarousel(id, direction) {
  const carousel = document.getElementById(id);
  const cardWidth = carousel.querySelector("div").offsetWidth + 24;
  carousel.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
}

async function login(username, password) {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login fallido");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  alert("Login exitoso ✅");
}

async function saveCombos(yamlContent) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión primero");
    return;
  }

  const res = await fetch("/save-combos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: yamlContent }),
  });

  const result = await res.json();
  if (result.success) {
    alert("Archivo combos.yml actualizado 🎉");
  } else {
    alert("Error: " + (result.error || "desconocido"));
  }
}

// Init
autoScrollCarousel("comboCarousel", 4000);
autoScrollCarousel("proyectosCarousel", 5000);
loadData();
