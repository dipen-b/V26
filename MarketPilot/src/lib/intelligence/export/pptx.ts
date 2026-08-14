import PptxGenJS from 'pptxgenjs'
import type { Doc, DocBlock } from './doc'

const INK = '0F172A'
const MUTED = '475569'
const ACCENT = '4F46E5'
const BAND = 'F1F5F9'
const WHITE = 'FFFFFF'

// 16:9 layout in inches.
const W = 13.33
const H = 7.5
const PAD = 0.6
const BODY_TOP = 1.5
const BODY_HEIGHT = H - BODY_TOP - 0.7

/** Bullets per slide before the section spills onto a continuation slide. */
const BULLETS_PER_SLIDE = 7
const TABLE_ROWS_PER_SLIDE = 9

type Deck = InstanceType<typeof PptxGenJS>
type Slide = ReturnType<Deck['addSlide']>

/** Groups the flat block list into one section per heading. */
function toSections(blocks: DocBlock[]) {
  const sections: { title: string; blocks: DocBlock[] }[] = []
  let current: { title: string; blocks: DocBlock[] } = { title: '', blocks: [] }

  for (const block of blocks) {
    if (block.type === 'heading') {
      if (current.title || current.blocks.length) sections.push(current)
      current = { title: block.text, blocks: [] }
    } else {
      current.blocks.push(block)
    }
  }
  if (current.title || current.blocks.length) sections.push(current)
  return sections
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function addSectionSlide(deck: Deck, title: string, continuation: boolean): Slide {
  const slide = deck.addSlide()
  slide.background = { color: WHITE }
  slide.addShape('rect', { x: 0, y: 0, w: 0.14, h: H, fill: { color: ACCENT } })
  slide.addText(continuation ? `${title} (cont.)` : title, {
    x: PAD,
    y: 0.55,
    w: W - PAD * 2,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: INK,
  })
  slide.addShape('line', {
    x: PAD,
    y: 1.25,
    w: W - PAD * 2,
    h: 0,
    line: { color: 'E2E8F0', width: 1 },
  })
  return slide
}

export async function renderPptx(doc: Doc): Promise<Buffer> {
  const deck = new PptxGenJS()
  deck.layout = 'LAYOUT_WIDE'
  deck.title = doc.title

  // Title slide.
  const cover = deck.addSlide()
  cover.background = { color: INK }
  cover.addText('MARKETPILOT AI', {
    x: PAD,
    y: 2.2,
    w: W - PAD * 2,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT,
    charSpacing: 2,
  })
  cover.addText(doc.title, {
    x: PAD,
    y: 2.7,
    w: W - PAD * 2,
    h: 1.4,
    fontSize: 34,
    bold: true,
    color: WHITE,
  })
  cover.addText(doc.subtitle, {
    x: PAD,
    y: 4.1,
    w: W - PAD * 2,
    h: 0.5,
    fontSize: 14,
    color: 'CBD5E1',
  })
  cover.addText(`Generated ${new Date(doc.generatedAt).toLocaleString('en-US')}`, {
    x: PAD,
    y: 6.5,
    w: W - PAD * 2,
    h: 0.3,
    fontSize: 10,
    color: '94A3B8',
  })

  for (const section of toSections(doc.blocks)) {
    let slide = addSectionSlide(deck, section.title, false)
    let cursor = BODY_TOP
    let used = false

    const newSlide = () => {
      slide = addSectionSlide(deck, section.title, true)
      cursor = BODY_TOP
      used = false
    }

    const room = (needed: number) => {
      if (cursor + needed > BODY_TOP + BODY_HEIGHT && used) newSlide()
    }

    for (const block of section.blocks) {
      switch (block.type) {
        case 'subheading': {
          room(0.9)
          slide.addText(block.text, {
            x: PAD,
            y: cursor,
            w: W - PAD * 2,
            h: 0.35,
            fontSize: 14,
            bold: true,
            color: ACCENT,
          })
          cursor += 0.5
          used = true
          break
        }

        case 'paragraph': {
          const height = Math.min(2.4, 0.32 + block.text.length / 190)
          room(height)
          slide.addText(block.text, {
            x: PAD,
            y: cursor,
            w: W - PAD * 2,
            h: height,
            fontSize: 13,
            color: INK,
            valign: 'top',
          })
          cursor += height + 0.2
          used = true
          break
        }

        case 'bullets': {
          for (const group of chunk(block.items, BULLETS_PER_SLIDE)) {
            const height = group.length * 0.42
            room(height)
            slide.addText(
              group.map((item) => ({ text: item, options: { breakLine: true } })),
              {
                x: PAD,
                y: cursor,
                w: W - PAD * 2,
                h: height,
                fontSize: 12.5,
                color: INK,
                bullet: { code: '2022' },
                lineSpacingMultiple: 1.15,
                valign: 'top',
              },
            )
            cursor += height + 0.2
            used = true
          }
          break
        }

        case 'kv': {
          for (const group of chunk(block.items, 6)) {
            room(group.length * 0.5)
            slide.addTable(
              group.map((item) => [
                { text: item.label, options: { bold: true, color: MUTED, fontSize: 10 } },
                { text: item.value, options: { color: INK, fontSize: 11 } },
              ]),
              {
                x: PAD,
                y: cursor,
                w: W - PAD * 2,
                colW: [3.1, W - PAD * 2 - 3.1],
                border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
                valign: 'top',
              },
            )
            cursor += group.length * 0.5 + 0.2
            used = true
          }
          break
        }

        case 'scores': {
          room(1.5)
          const boxW = (W - PAD * 2 - 0.2 * (block.items.length - 1)) / block.items.length
          block.items.forEach((item, index) => {
            const x = PAD + index * (boxW + 0.2)
            slide.addShape('roundRect', {
              x,
              y: cursor,
              w: boxW,
              h: 1.1,
              fill: { color: BAND },
              rectRadius: 0.08,
            })
            slide.addText(item.label.toUpperCase(), {
              x: x + 0.12,
              y: cursor + 0.12,
              w: boxW - 0.24,
              h: 0.3,
              fontSize: 8,
              bold: true,
              color: MUTED,
            })
            slide.addText(item.value === null ? 'n/a' : String(item.value), {
              x: x + 0.12,
              y: cursor + 0.42,
              w: boxW - 0.24,
              h: 0.55,
              fontSize: 24,
              bold: true,
              color: item.value === null ? MUTED : ACCENT,
            })
          })
          cursor += 1.4
          used = true
          break
        }

        case 'table': {
          if (!block.rows.length) break
          const header = block.columns.map((column) => ({
            text: column,
            options: { bold: true, color: MUTED, fill: { color: BAND }, fontSize: 9 },
          }))
          for (const group of chunk(block.rows, TABLE_ROWS_PER_SLIDE)) {
            room(0.4 + group.length * 0.34)
            slide.addText(block.name, {
              x: PAD,
              y: cursor,
              w: W - PAD * 2,
              h: 0.3,
              fontSize: 12,
              bold: true,
              color: ACCENT,
            })
            cursor += 0.38
            slide.addTable(
              [header, ...group.map((row) => row.map((cell) => ({ text: cell ?? '', options: { fontSize: 9, color: INK } })))],
              {
                x: PAD,
                y: cursor,
                w: W - PAD * 2,
                border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
                autoPage: false,
                valign: 'top',
              },
            )
            cursor += group.length * 0.34 + 0.5
            used = true
          }
          break
        }
      }
    }
  }

  // `write` returns a Node Buffer under the 'nodebuffer' output type.
  const output = (await deck.write({ outputType: 'nodebuffer' })) as Buffer
  return output
}
