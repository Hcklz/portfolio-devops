import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const htmlPath = path.join(rootDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('ERRO: index.html não encontrado na raiz do projeto.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

const ids = new Set();
for (const match of html.matchAll(/\bid\s*=\s*"([^"]+)"/gi)) {
  ids.add(match[1]);
}

const targets = [];

for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"]*)"/gi)) {
  targets.push({ tag: 'a', attr: 'href', value: match[1].trim() });
}

for (const match of html.matchAll(/<img\b[^>]*\bsrc\s*=\s*"([^"]*)"/gi)) {
  targets.push({ tag: 'img', attr: 'src', value: match[1].trim() });
}

for (const match of html.matchAll(/<link\b[^>]*\bhref\s*=\s*"([^"]*)"/gi)) {
  targets.push({ tag: 'link', attr: 'href', value: match[1].trim() });
}

async function checkExternalUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'portfolio-ci-link-checker/1.0' }
    });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'portfolio-ci-link-checker/1.0' }
      });
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: err.message };
  } finally {
    clearTimeout(timer);
  }
}

let failures = 0;

for (const item of targets) {
  const { tag, attr, value } = item;

  if (!value || value === '#') {
    console.error(`ERRO [${tag} ${attr}]: valor vazio ou inválido ("${value}")`);
    failures++;
    continue;
  }

  if (value.startsWith('#')) {
    const anchor = value.slice(1);
    if (!ids.has(anchor)) {
      console.error(`ERRO [${tag} ${attr}]: âncora "${value}" não encontrada no HTML.`);
      failures++;
    } else {
      console.log(`OK [âncora]: ${value}`);
    }
    continue;
  }

  if (value.startsWith('mailto:')) {
    const validEmail = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value);
    if (!validEmail) {
      console.error(`ERRO [${tag} ${attr}]: e-mail inválido "${value}"`);
      failures++;
    } else {
      console.log(`OK [mailto]: ${value}`);
    }
    continue;
  }

  if (/^https?:\/\//i.test(value)) {
    const result = await checkExternalUrl(value);
    if (!result.ok) {
      console.error(`ERRO [${tag} ${attr}]: URL inacessível (${result.status}) -> ${value}`);
      failures++;
    } else {
      console.log(`OK [HTTP ${result.status}]: ${value}`);
    }
    continue;
  }

  const cleanLocal = value.split(/[?#]/)[0];
  const resolved = path.resolve(rootDir, cleanLocal);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    console.error(`ERRO [${tag} ${attr}]: arquivo local não encontrado -> ${value}`);
    failures++;
  } else {
    console.log(`OK [arquivo]: ${value}`);
  }
}

if (failures > 0) {
  console.error(`\nFalha na validação: ${failures} link(s) ou imagem(ns) inválido(s).`);
  process.exit(1);
}

console.log(`\nValidação concluída: ${targets.length} referências verificadas com sucesso.`);
