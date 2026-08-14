import PDFDocument from 'pdfkit'
import type { Doc, DocBlock } from './doc'

// Print palette: the app's indigo on white, since a report is read on paper or
// in a viewer, not on the dark app surface.
const INK = '#0F172A'
const MUTED = '#475569'
const ACCENT = '#4F46E5'
const RULE = '#E2E8F0'
const BAND = '#F1F5F9'

const MARGIN = 54
const PAGE_WIDTH = 595.28 // A4 points
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

type Pdf = InstanceType<typeof PDFDocument>

function ensureSpace(pdf: Pdf, needed: number) {
  if (pdf.y + needed > pdf.page.height - MARGIN) pdf.addPage()
}

function heading(pdf: Pdf, text: string) {
  ensureSpace(pdf, 60)
  pdf.moveDown(0.8)
  pdf.fillColor(ACCENT).font('Helvetica-Bold').fontSize(13).text(text.toUpperCase(), { characterSpacing: 0.6 })
  const y = pdf.y + 4
  pdf.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor(RULE).lineWidth(1).stroke()
  pdf.moveDown(0.6)
}

function subheading(pdf: Pdf, text: string) {
  ensureSpace(pdf, 40)
  pdf.moveDown(0.4)
  pdf.fillColor(INK).font('Helvetica-Bold').fontSize(10).text(text)
  pdf.moveDown(0.2)
}

function paragraph(pdf: Pdf, text: string) {
  ensureSpace(pdf, 40)
  pdf.fillColor(INK).font('Helvetica').fontSize(9.5).text(text, { align: 'left', lineGap: 2.5 })
  pdf.moveDown(0.5)
}

function bullets(pdf: Pdf, items: string[]) {
  pdf.font('Helvetica').fontSize(9.5)
  for (const item of items) {
    const height = pdf.heightOfString(item, { width: CONTENT_WIDTH - 14, lineGap: 2 })
    ensureSpace(pdf, height + 6)
    const top = pdf.y
    pdf.fillColor(ACCENT).circle(MARGIN + 3, top + 5, 1.8).fill()
    pdf.fillColor(INK).text(item, MARGIN + 14, top, { width: CONTENT_WIDTH - 14, lineGap: 2 })
    pdf.moveDown(0.25)
  }
  pdf.moveDown(0.3)
}

function keyValues(pdf: Pdf, items: { label: string; value: string }[]) {
  const labelWidth = 132
  const valueWidth = CONTENT_WIDTH - labelWidth - 10
  for (const item of items) {
    pdf.font('Helvetica').fontSize(9.5)
    const height = Math.max(
      pdf.heightOfString(item.value, { width: valueWidth, lineGap: 2 }),
      pdf.heightOfString(item.label, { width: labelWidth }),
    )
    ensureSpace(pdf, height + 8)
    const top = pdf.y
    pdf.fillColor(MUTED).font('Helvetica-Bold').fontSize(8.5).text(item.label, MARGIN, top + 1, { width: labelWidth })
    pdf.fillColor(INK).font('Helvetica').fontSize(9.5).text(item.value, MARGIN + labelWidth + 10, top, {
      width: valueWidth,
      lineGap: 2,
    })
    pdf.y = top + height + 6
  }
  pdf.moveDown(0.3)
}

function scores(pdf: Pdf, items: { label: string; value: number | null }[]) {
  const perRow = 4
  const gap = 10
  const boxWidth = (CONTENT_WIDTH - gap * (perRow - 1)) / perRow
  const boxHeight = 46

  for (let i = 0; i < items.length; i += perRow) {
    const row = items.slice(i, i + perRow)
    ensureSpace(pdf, boxHeight + 10)
    const top = pdf.y
    row.forEach((item, column) => {
      const x = MARGIN + column * (boxWidth + gap)
      pdf.roundedRect(x, top, boxWidth, boxHeight, 5).fillColor(BAND).fill()
      pdf
        .fillColor(MUTED)
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .text(item.label.toUpperCase(), x + 8, top + 8, { width: boxWidth - 16, characterSpacing: 0.4 })
      pdf
        .fillColor(item.value === null ? MUTED : ACCENT)
        .font('Helvetica-Bold')
        .fontSize(17)
        .text(item.value === null ? 'n/a' : String(item.value), x + 8, top + 20, { width: boxWidth - 16 })
    })
    pdf.y = top + boxHeight + gap
  }
  pdf.moveDown(0.2)
}

function table(pdf: Pdf, name: string, columns: string[], rows: string[][]) {
  if (!rows.length) return
  subheading(pdf, name)

  // Weight columns by their longest cell so prose columns get the room.
  const weights = columns.map((column, index) => {
    const longest = rows.reduce((max, row) => Math.max(max, (row[index] ?? '').length), column.length)
    return Math.min(Math.max(longest, 8), 60)
  })
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const widths = weights.map((weight) => (weight / total) * CONTENT_WIDTH)

  const drawRow = (cells: string[], isHeader: boolean) => {
    pdf.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(isHeader ? 7.5 : 8)
    const height =
      Math.max(
        ...cells.map((cell, index) =>
          pdf.heightOfString(cell ?? '', { width: widths[index] - 10, lineGap: 1.5 }),
        ),
      ) + 8

    ensureSpace(pdf, height + 2)
    const top = pdf.y

    if (isHeader) {
      pdf.rect(MARGIN, top, CONTENT_WIDTH, height).fillColor(BAND).fill()
    }

    let x = MARGIN
    cells.forEach((cell, index) => {
      pdf
        .fillColor(isHeader ? MUTED : INK)
        .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isHeader ? 7.5 : 8)
        .text(cell ?? '', x + 5, top + 4, { width: widths[index] - 10, lineGap: 1.5 })
      x += widths[index]
    })

    pdf.y = top + height
    pdf
      .moveTo(MARGIN, pdf.y)
      .lineTo(PAGE_WIDTH - MARGIN, pdf.y)
      .strokeColor(RULE)
      .lineWidth(0.5)
      .stroke()
  }

  drawRow(columns, true)
  rows.forEach((row) => drawRow(row, false))
  pdf.moveDown(0.6)
}

function renderBlock(pdf: Pdf, block: DocBlock) {
  switch (block.type) {
    case 'heading':
      return heading(pdf, block.text)
    case 'subheading':
      return subheading(pdf, block.text)
    case 'paragraph':
      return paragraph(pdf, block.text)
    case 'bullets':
      return bullets(pdf, block.items)
    case 'kv':
      return keyValues(pdf, block.items)
    case 'scores':
      return scores(pdf, block.items)
    case 'table':
      return table(pdf, block.name, block.columns, block.rows)
  }
}

export async function renderPdf(doc: Doc): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true })
    const chunks: Buffer[] = []

    pdf.on('data', (chunk: Buffer) => chunks.push(chunk))
    pdf.on('end', () => resolve(Buffer.concat(chunks)))
    pdf.on('error', reject)

    try {
      pdf.fillColor(ACCENT).font('Helvetica-Bold').fontSize(8).text('MARKETPILOT AI', { characterSpacing: 1.2 })
      pdf.moveDown(0.6)
      pdf.fillColor(INK).font('Helvetica-Bold').fontSize(21).text(doc.title, { lineGap: 3 })
      pdf.moveDown(0.3)
      pdf.fillColor(MUTED).font('Helvetica').fontSize(9.5).text(doc.subtitle)
      pdf
        .fillColor(MUTED)
        .fontSize(8)
        .text(`Generated ${new Date(doc.generatedAt).toLocaleString('en-US')}`)
      pdf.moveDown(0.8)

      doc.blocks.forEach((block) => renderBlock(pdf, block))

      // Page numbers, added once the page count is known.
      const range = pdf.bufferedPageRange()
      for (let index = 0; index < range.count; index++) {
        pdf.switchToPage(range.start + index)
        pdf
          .fillColor(MUTED)
          .font('Helvetica')
          .fontSize(7.5)
          .text(
            `${doc.title}  ·  ${index + 1} of ${range.count}`,
            MARGIN,
            pdf.page.height - MARGIN + 14,
            { width: CONTENT_WIDTH, align: 'center', lineBreak: false },
          )
      }

      pdf.end()
    } catch (err) {
      reject(err)
    }
  })
}
