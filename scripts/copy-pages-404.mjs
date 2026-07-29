import { copyFile } from "node:fs/promises";

await copyFile("pages-out/github-pages-src/index.html", "pages-out/index.html");
await copyFile("pages-out/github-pages-src/index.html", "pages-out/404.html");
