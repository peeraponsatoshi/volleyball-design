/**
 * Convert yft-design volleyball templates -> VolleyGP_V2 .vgp files (v1 schema).
 *
 * Usage:  node scripts/exportToVgp.mjs [outDir]
 *
 * Reads src/mocks/volleyballTemplates.ts directly (transpiled on the fly) so the
 * templates stay the single source of truth - no duplicated layout code here.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC = join(ROOT, 'src', 'mocks', 'volleyballTemplates.ts')
const OUT_DIR = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(ROOT, '..', 'VolleyGP_V2', 'imported_templates')

/** Target fabric version used by VolleyGP_V2 */
const FABRIC_VERSION = '7.2.0'

/**
 * VolleyGP_V2 only loads these families (Google Fonts CDN, styles/index.css).
 * Anything else silently falls back and breaks the layout, so remap up front.
 */
const FONT_MAP = {
  Sarabun: 'Prompt',
  'Noto Sans Thai': 'Prompt',
  Mitr: 'Kanit',
  'Chakra Petch': 'Kanit',
  'IBM Plex Sans Thai': 'Prompt',
  Prompt: 'Prompt',
  Kanit: 'Kanit',
}
const FONT_FALLBACK = 'Prompt'

/** Canvas-app-only props that mean nothing to VolleyGP_V2 */
const DROP_PROPS = ['fillType', 'color', 'id', 'name']

// ---------------------------------------------------------------------------
// 1. Load the templates by transpiling the TS module
// ---------------------------------------------------------------------------

async function loadCatalog() {
  let code = readFileSync(SRC, 'utf8')

  // Strip the two aliased imports and inline what they provided.
  code = code
    .replace(/^import\s+\{\s*Template\s*\}.*$/m, '')
    .replace(/^import\s+\{\s*DEFAULT_FONT_FAMILY\s*\}.*$/m, "const DEFAULT_FONT_FAMILY = 'Sarabun'")

  const js = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText

  const tmp = join(ROOT, `.tmp-vb-templates-${Date.now()}.mjs`)
  writeFileSync(tmp, js, 'utf8')
  try {
    return (await import(pathToFileURL(tmp).href)).VolleyballTemplateCatalog
  } finally {
    rmSync(tmp, { force: true })
  }
}

// ---------------------------------------------------------------------------
// 2. Convert one fabric object
// ---------------------------------------------------------------------------

/** Human-readable layer name for the VolleyGP layer panel */
function layerName(obj, index) {
  if (obj.type === 'Textbox' && typeof obj.text === 'string') {
    const line = obj.text.split('\n')[0].trim()
    if (line) return line.length > 28 ? `${line.slice(0, 28)}...` : line
  }
  if (obj.type === 'Rect') return `รูปทรง ${index + 1}`
  return `${obj.type} ${index + 1}`
}

function convertObject(obj, index) {
  const out = { ...obj }

  for (const key of DROP_PROPS) delete out[key]

  // canvas `id`/`name` -> VolleyGP metadata
  out._vgp_id = `layer-${index}`
  out._vgp_name = layerName(obj, index)
  out.version = FABRIC_VERSION

  if (out.fontFamily) {
    out.fontFamily = FONT_MAP[out.fontFamily] || FONT_FALLBACK
  }

  // A null stroke with strokeWidth 1 renders nothing, but fabric 7 keeps the
  // width around and it shows up in the properties panel. Normalize it.
  if (out.stroke == null) {
    out.stroke = null
    out.strokeWidth = 0
  }

  return out
}

/** Does this object already paint the whole page? */
function coversPage(obj, w, h) {
  return (
    obj.type === 'Rect' &&
    obj.left === 0 &&
    obj.top === 0 &&
    obj.width === w &&
    obj.height === h &&
    obj.opacity === 1
  )
}

/**
 * Explicit background layer. VolleyGP loads pages with `loadFromJSON`, which
 * reads the fabric key `backgroundColor` - not `background` - so relying on the
 * canvasData key would silently drop the template's dark background. Its own
 * .vgp files ship a full-page Rect named "พื้นหลัง" instead, so match that.
 */
function backgroundRect(fill, w, h) {
  return {
    rx: 0,
    ry: 0,
    type: 'Rect',
    version: FABRIC_VERSION,
    originX: 'left',
    originY: 'top',
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill,
    padding: 0,
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: 'butt',
    strokeDashOffset: 0,
    strokeLineJoin: 'miter',
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: '',
    fillRule: 'nonzero',
    paintFirst: 'fill',
    globalCompositeOperation: 'source-over',
    skewX: 0,
    skewY: 0,
    selectable: true,
    evented: true,
    objectCaching: false,
    transparentCorners: false,
    hasBorders: true,
    lockMovementX: false,
    lockMovementY: false,
    _vgp_id: 'layer-bg',
    _vgp_name: 'พื้นหลัง',
  }
}

function convertTemplate(entry) {
  const tpl = entry.template
  const { width: w, height: h } = tpl

  const source = []
  let background = '#0b1f3a'

  tpl.objects.forEach((obj) => {
    // The workspace rect is a canvas-app concept, not a real layer - keep only
    // its fill, which is the page background.
    if (obj.id === 'WorkSpaceDrawType') {
      background = obj.fill || background
      return
    }
    source.push(obj)
  })

  // Skip the extra layer when the template already starts with a full-page rect.
  const needsBg = !(source.length && coversPage(source[0], w, h))
  const objects = needsBg ? [backgroundRect(background, w, h)] : []

  source.forEach((obj) => objects.push(convertObject(obj, objects.length)))

  return {
    version: '1.0.0',
    projectName: entry.name,
    canvasWidth: w,
    canvasHeight: h,
    canvasData: {
      version: FABRIC_VERSION,
      objects,
      background,
      backgroundColor: background,
    },
  }
}

// ---------------------------------------------------------------------------
// 3. Run
// ---------------------------------------------------------------------------

const catalog = await loadCatalog()
mkdirSync(OUT_DIR, { recursive: true })

for (const entry of catalog) {
  const doc = convertTemplate(entry)
  const file = join(OUT_DIR, `${entry.id}.vgp`)
  writeFileSync(file, JSON.stringify(doc, null, 2), 'utf8')
  console.log(
    `${entry.id}.vgp  ${doc.canvasWidth}x${doc.canvasHeight}  ` +
      `${doc.canvasData.objects.length} objects  (${entry.name})`
  )
}

console.log(`\n${catalog.length} templates -> ${OUT_DIR}`)
