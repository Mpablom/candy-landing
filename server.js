import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;
const SECRET = "supersecreto"; // cámbialo en producción

// helpers para __dirname (porque usamos type:module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Login ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Usuarios hardcodeados
  const users = [{ username: "admin", password: "1234" }];

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// --- Guardar combos.yml ---
app.post("/save-combos", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  try {
    jwt.verify(auth.replace("Bearer ", ""), SECRET);
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }

  const yamlData = req.body.data;
  const filePath = path.join(__dirname, "public", "data", "combos.yml");
  fs.writeFileSync(filePath, yamlData, "utf8");

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
