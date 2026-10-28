import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../_site/', import.meta.url);
const pages = ['/', '/methode/', '/outils/', '/visibilite-locale/', '/satisfaction-client/', '/hospitality/', '/restauration/', '/retail/', '/articles/que-faire-avec-douze-avis-clients/', '/a-propos/', '/contribuer/'];
const read = (path) => readFileSync(new URL(`.${path}index.html`, root), 'utf8');

test('eleven public pages have unique titles, canonical URLs and visible ownership', () => {
  const titles = new Set();
  for (const path of pages) {
    const html = read(path);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, path);
    assert.ok(!titles.has(title), title);
    titles.add(title);
    assert.ok(html.includes(`rel="canonical" href="https://ranksas.github.io${path}"`), path);
    assert.ok(html.includes(`http-equiv="refresh" content="0;url=https://ranksas.github.io${path}"`), path);
    assert.ok(html.includes('créé et exploité par <a href="https://myfrank.io/">MyFrank</a>'), path);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
  }
});

test('original example and local calculator are delivered, not merely claimed', () => {
  const article = read('/articles/que-faire-avec-douze-avis-clients/');
  assert.ok(article.includes('3/12 = 25 %'));
  assert.ok(article.includes('Exemple fictif') || article.includes('exemple fictif'));
  assert.ok(article.includes('utm_source=terrainvisible'));
  const tool = read('/outils/');
  assert.ok(tool.includes('id="calculator"'));
  assert.ok(tool.includes('/assets/calculator.js'));
  assert.ok(readFileSync(new URL('./assets/calculator.js', root), 'utf8').includes('mentions > total'));
});

test('sitemap and robots list the canonical host and no nonexistent page', () => {
  const sitemap = readFileSync(new URL('./sitemap.xml', root), 'utf8');
  const robots = readFileSync(new URL('./robots.txt', root), 'utf8');
  for (const path of pages) assert.ok(sitemap.includes(`https://ranksas.github.io${path}</loc>`), path);
  assert.ok(robots.includes('Sitemap: https://ranksas.github.io/sitemap.xml'));
  assert.ok(!sitemap.includes('/contact'));
});
