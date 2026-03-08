import express from "express";
import multer from "multer";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import { join, basename, extname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.static(join(__dirname, "public")));
app.use("/assets", express.static(join(ROOT, "public/assets")));

// --- File paths ---
const PHOTOS_JSON = join(ROOT, "src/data/photos.json");
const METADATA_JSON = join(ROOT, "photos-source/metadata.json");
const PHOTOS_SOURCE = join(ROOT, "photos-source");
const RECS_JSON = join(ROOT, "src/data/recommendations.json");
const RECS_COVERS = join(ROOT, "public/assets/img/recommendations");
const BLOG_DIR = join(ROOT, "src/content/blog");

// --- Helpers ---
function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// =====================
// PHOTOGRAPHY API
// =====================

const photoUpload = multer({ dest: join(PHOTOS_SOURCE) });

app.get("/api/photos", (_req, res) => {
  const photos = existsSync(PHOTOS_JSON) ? readJSON(PHOTOS_JSON) : [];
  const metadata = existsSync(METADATA_JSON) ? readJSON(METADATA_JSON) : {};
  res.json({ photos, metadata });
});

app.get("/api/tags", (_req, res) => {
  const tags = { photos: new Set(), posts: new Set(), recs: new Set() };

  // Photo tags from metadata
  const metadata = existsSync(METADATA_JSON) ? readJSON(METADATA_JSON) : {};
  for (const meta of Object.values(metadata)) {
    for (const t of meta.tags || []) tags.photos.add(t);
  }

  // Blog post tags
  if (existsSync(BLOG_DIR)) {
    const years = readdirSync(BLOG_DIR).filter(f => /^\d{4}$/.test(f));
    for (const year of years) {
      const files = readdirSync(join(BLOG_DIR, year)).filter(f => f.endsWith(".md"));
      for (const file of files) {
        const content = readFileSync(join(BLOG_DIR, year, file), "utf-8");
        const tagMatches = [...content.matchAll(/^\s+-\s+(.+)$/gm)];
        for (const m of tagMatches) tags.posts.add(m[1].trim());
      }
    }
  }

  // Recommendation tags
  const recs = existsSync(RECS_JSON) ? readJSON(RECS_JSON) : [];
  for (const r of recs) {
    for (const t of r.tags || []) tags.recs.add(t);
  }

  res.json({
    photos: [...tags.photos].sort(),
    posts: [...tags.posts].sort(),
    recs: [...tags.recs].sort(),
  });
});

app.post("/api/photos/upload", photoUpload.array("photos", 50), (req, res) => {
  const results = [];
  for (const file of req.files) {
    const ext = extname(file.originalname).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".arw"];
    if (!allowed.includes(ext)) {
      unlinkSync(file.path);
      continue;
    }
    const dest = join(PHOTOS_SOURCE, file.originalname);
    try {
      renameSync(file.path, dest);
      results.push(file.originalname);
    } catch {
      try { unlinkSync(file.path); } catch {}
    }
  }
  res.json({ uploaded: results });
});

app.put("/api/photos/metadata/:filename", (req, res) => {
  const { filename } = req.params;
  const { tags, caption } = req.body;
  const metadata = existsSync(METADATA_JSON) ? readJSON(METADATA_JSON) : {};
  metadata[filename] = {
    caption: caption ?? metadata[filename]?.caption ?? "",
    tags: tags ?? metadata[filename]?.tags ?? [],
  };
  writeJSON(METADATA_JSON, metadata);
  res.json({ ok: true });
});

app.delete("/api/photos/:filename", (req, res) => {
  const { filename } = req.params;
  const deleted = [];

  // Remove from metadata.json
  const metadata = existsSync(METADATA_JSON) ? readJSON(METADATA_JSON) : {};
  if (metadata[filename]) {
    delete metadata[filename];
    writeJSON(METADATA_JSON, metadata);
    deleted.push("metadata");
  }

  // Remove source file
  const sourcePath = join(PHOTOS_SOURCE, filename);
  if (existsSync(sourcePath)) {
    unlinkSync(sourcePath);
    deleted.push("source");
  }

  // Remove generated thumb and display (webp, same base name)
  const base = basename(filename, extname(filename));
  const thumbPath = join(ROOT, "public/assets/img/photography/thumbs", `${base}.webp`);
  const displayPath = join(ROOT, "public/assets/img/photography/display", `${base}.webp`);
  if (existsSync(thumbPath)) { unlinkSync(thumbPath); deleted.push("thumb"); }
  if (existsSync(displayPath)) { unlinkSync(displayPath); deleted.push("display"); }

  // Remove from photos.json
  if (existsSync(PHOTOS_JSON)) {
    const photos = readJSON(PHOTOS_JSON);
    const filtered = photos.filter(p => !p.thumb.includes(`${base}.webp`));
    if (filtered.length !== photos.length) {
      writeJSON(PHOTOS_JSON, filtered);
      deleted.push("photos.json");
    }
  }

  res.json({ ok: true, deleted });
});

app.post("/api/photos/process", (_req, res) => {
  try {
    const output = execSync("node scripts/extract-exif.mjs", {
      cwd: ROOT,
      encoding: "utf-8",
      timeout: 120000,
    });
    res.json({ ok: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message, output: err.stdout });
  }
});

// =====================
// BLOG API
// =====================

app.get("/api/posts", (_req, res) => {
  const posts = [];
  const years = readdirSync(BLOG_DIR).filter(f => /^\d{4}$/.test(f));
  for (const year of years) {
    const dir = join(BLOG_DIR, year);
    const files = readdirSync(dir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const content = readFileSync(join(dir, file), "utf-8");
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        posts.push({
          year,
          slug: file.replace(/\.md$/, ""),
          frontmatter: match[1],
          body: match[2],
          raw: content,
        });
      }
    }
  }
  posts.sort((a, b) => b.year.localeCompare(a.year) || b.slug.localeCompare(a.slug));
  res.json(posts);
});

app.get("/api/posts/:year/:slug", (req, res) => {
  const { year, slug } = req.params;
  const filePath = join(BLOG_DIR, year, `${slug}.md`);
  if (!existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  const content = readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return res.status(400).json({ error: "Invalid frontmatter" });
  res.json({ year, slug, frontmatter: match[1], body: match[2], raw: content });
});

app.post("/api/posts", (req, res) => {
  const { year, slug, title, description, tags, body, draft } = req.body;
  if (!year || !slug || !title || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const dir = join(BLOG_DIR, year);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${slug}.md`);
  if (existsSync(filePath)) return res.status(409).json({ error: "Post already exists" });

  const now = new Date().toISOString();
  const tagList = (tags || []).map(t => `  - ${t}`).join("\n");
  const frontmatter = [
    "---",
    `title: "${title}"`,
    `pubDatetime: ${now}`,
    `description: "${description}"`,
    `tags:`,
    tagList || "  - others",
    draft ? "draft: true" : null,
    "---",
  ].filter(Boolean).join("\n");

  writeFileSync(filePath, frontmatter + "\n\n" + (body || "") + "\n", "utf-8");
  res.json({ ok: true, path: `src/content/blog/${year}/${slug}.md` });
});

app.put("/api/posts/:year/:slug", (req, res) => {
  const { year, slug } = req.params;
  const { raw } = req.body;
  if (!raw) return res.status(400).json({ error: "Missing content" });
  const filePath = join(BLOG_DIR, year, `${slug}.md`);
  if (!existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  writeFileSync(filePath, raw, "utf-8");
  res.json({ ok: true });
});

app.delete("/api/posts/:year/:slug", (req, res) => {
  const { year, slug } = req.params;
  const filePath = join(BLOG_DIR, year, `${slug}.md`);
  if (!existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  unlinkSync(filePath);
  res.json({ ok: true });
});

// =====================
// RECOMMENDATIONS API
// =====================

const recUpload = multer({ dest: RECS_COVERS });

app.get("/api/recommendations", (_req, res) => {
  const recs = existsSync(RECS_JSON) ? readJSON(RECS_JSON) : [];
  res.json(recs);
});

app.post("/api/recommendations", (req, res) => {
  const recs = existsSync(RECS_JSON) ? readJSON(RECS_JSON) : [];
  const entry = req.body;
  if (!entry.title || !entry.type) {
    return res.status(400).json({ error: "Missing title or type" });
  }
  recs.unshift({
    type: entry.type,
    title: entry.title,
    creator: entry.creator || "",
    cover: entry.cover || "",
    note: entry.note || "",
    tags: entry.tags || [],
    rating: Number(entry.rating) || 0,
    date: entry.date || "",
  });
  writeJSON(RECS_JSON, recs);
  res.json({ ok: true });
});

app.put("/api/recommendations/:index", (req, res) => {
  const recs = existsSync(RECS_JSON) ? readJSON(RECS_JSON) : [];
  const idx = parseInt(req.params.index, 10);
  if (idx < 0 || idx >= recs.length) return res.status(404).json({ error: "Not found" });
  recs[idx] = { ...recs[idx], ...req.body };
  writeJSON(RECS_JSON, recs);
  res.json({ ok: true });
});

app.delete("/api/recommendations/:index", (req, res) => {
  const recs = existsSync(RECS_JSON) ? readJSON(RECS_JSON) : [];
  const idx = parseInt(req.params.index, 10);
  if (idx < 0 || idx >= recs.length) return res.status(404).json({ error: "Not found" });
  recs.splice(idx, 1);
  writeJSON(RECS_JSON, recs);
  res.json({ ok: true });
});

app.post("/api/recommendations/cover", recUpload.single("cover"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const ext = extname(req.file.originalname).toLowerCase();
  const name = basename(req.file.originalname, ext);
  const dest = join(RECS_COVERS, `${name}${ext}`);
  renameSync(req.file.path, dest);

  // Run optimize script to convert to webp
  try {
    execSync("node scripts/optimize-rec-images.mjs", { cwd: ROOT, encoding: "utf-8", timeout: 60000 });
  } catch { /* best effort */ }

  res.json({ path: `/assets/img/recommendations/${name}.webp` });
});

// =====================
// ABOUT PAGE API
// =====================

const ABOUT_FILE = join(ROOT, "src/pages/about.astro");

app.get("/api/about", (_req, res) => {
  if (!existsSync(ABOUT_FILE)) return res.status(404).json({ error: "Not found" });
  const content = readFileSync(ABOUT_FILE, "utf-8");
  const match = content.match(/<div class="prose dark:prose-invert max-w-none">\r?\n([\s\S]*?)\r?\n\s*<\/div>\r?\n\s*<\/Main>/);
  if (!match) return res.status(400).json({ error: "Could not parse about page" });
  res.json({ content: match[1] });
});

app.put("/api/about", (req, res) => {
  const { content: newContent } = req.body;
  if (newContent === undefined) return res.status(400).json({ error: "Missing content" });
  if (!existsSync(ABOUT_FILE)) return res.status(404).json({ error: "Not found" });

  const file = readFileSync(ABOUT_FILE, "utf-8");
  const updated = file.replace(
    /(<div class="prose dark:prose-invert max-w-none">)\r?\n[\s\S]*?\r?\n(\s*<\/div>\r?\n\s*<\/Main>)/,
    `$1\n${newContent}\n$2`
  );
  writeFileSync(ABOUT_FILE, updated, "utf-8");
  res.json({ ok: true });
});

// =====================
// START
// =====================

app.listen(PORT, () => {
  console.log(`\n  Admin UI running at http://localhost:${PORT}\n`);
});
