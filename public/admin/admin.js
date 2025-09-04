// Cargar combos existentes
async function loadCombos() {
  const res = await fetch("/api/combos");
  const data = await res.json();
  const list = document.getElementById("comboList");
  list.innerHTML = "";

  data.combos?.forEach((c) => {
    const div = document.createElement("div");
    div.className = "p-2 mb-2 bg-white dark:bg-gray-800 rounded shadow";
    div.innerHTML = `
      <strong>${c.nombre}</strong> - $${c.precio} <br>
      <em>${c.descripcion}</em><br>
      <img src="${c.imagen}" width="250">
    `;
    list.appendChild(div);
  });
}

// Subir combo nuevo
document.getElementById("comboForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  // Subir imagen
  const file = formData.get("imagen");
  const uploadData = new FormData();
  uploadData.append("image", file);
  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: uploadData,
  });
  const uploadJson = await uploadRes.json();

  // Agregar combo
  const newCombo = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    precio: formData.get("precio"),
    imagen: uploadJson.url,
  };

  // Traer combos existentes
  const res = await fetch("/api/combos");
  const data = await res.json();
  const combos = data.combos || [];
  combos.push(newCombo);

  // Guardar
  await fetch("/api/combos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ combos }),
  });

  form.reset();
  loadCombos();
});

loadCombos();
