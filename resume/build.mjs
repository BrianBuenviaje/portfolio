// Prints resume/resume.html to public/Resume.pdf with headless Chrome (or Edge).   npm run resume
// A second argument writes somewhere else:  node resume/build.mjs path/to/out.pdf
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, 'resume.html')
const out = resolve(process.argv[2] || join(here, '..', 'public', 'Resume.pdf'))

const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p))
if (!browser) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to the browser executable.')
  process.exit(1)
}

// Its own throwaway profile: with the everyday profile, a Chrome that is already open swallows the command.
const profile = mkdtempSync(join(tmpdir(), 'resume-print-'))
const run = spawnSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-pdf-header-footer',
  `--user-data-dir=${profile}`,
  `--print-to-pdf=${out}`,
  pathToFileURL(src).href,
], { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' })
try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch { /* the profile is in the temp folder either way */ }

if (run.status !== 0 || !existsSync(out)) {
  console.error(run.stderr || 'The browser did not write the PDF.')
  process.exit(1)
}

// The résumé is a one-page document; count the page objects so an overflow is caught here, not by a reader.
const pages = (readFileSync(out, 'latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length
console.log(`${out}: ${pages} page${pages === 1 ? '' : 's'}`)
if (pages !== 1) {
  console.error('The résumé no longer fits one page. Shorten resume/resume.html and run this again.')
  process.exit(1)
}
