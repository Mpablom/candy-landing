// server.js
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sesión
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  }),
);

// Carpeta pública y uploads
app.use(express.static(path.join(__dirname, "public")));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware para proteger admin
function requireLogin(req, res, next) {
  if (req.session?.loggedIn) return next();
  return res.redirect("/admin/login.html");
}

// --- Login / Logout ---
app.get("/admin/login.html", (req, res) => {
  // Si ya está logueado, redirige al admin
  if (req.session?.loggedIn) return res.redirect("/admin");
  res.sendFile(path.join(__dirname, "public/admin/login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    req.session.regenerate((err) => {
      if (err) return res.status(500).send("Error al iniciar sesión");
      req.session.loggedIn = true;
      res.redirect("/admin");
    });
  } else {
    res.status(401).send("Credenciales incorrectas");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("No se pudo cerrar sesión");
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/admin/login.html");
  });
});

// --- API Combos ---
app.get("/api/combos", (req, res) => {
  try {
    const combosFile = path.join(__dirname, "public/data/combos.yml");
    const data = yaml.load(fs.readFileSync(combosFile, "utf8"));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo leer combos" });
  }
});

app.post("/api/combos", requireLogin, (req, res) => {
  try {
    const combosFile = path.join(__dirname, "public/data/combos.yml");
    fs.writeFileSync(combosFile, yaml.dump(req.body), "utf8");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar combos" });
  }
});

// --- Upload imágenes ---
app.post("/api/upload", requireLogin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No se subió archivo");
  res.json({ url: "/uploads/" + req.file.filename });
});

// --- Rutas admin protegidas ---
app.get("/admin", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});

// Captura cualquier ruta admin que no exista para protegerla
app.get("/admin/*", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});

// --- Start ---
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`),
);
