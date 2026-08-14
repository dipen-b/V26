import ExcelJS from 'exceljs'
import type { Doc, DocBlock } from './doc'

const INK = 'FF0F172A'
const MUTED = 'FF475569'
const ACCENT = 'FF4F46E5'
const BAND = 'FFF1F5F9'

/** Excel sheet names cap at 31 chars and cannot contain : \ / ? * [ ] */
function sheetName(raw: string, taken: Set<string>): string {
  const cleaned = raw.replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31) || 'Sheet'
  if (!taken.has(cleaned)) {
    taken.add(cleaned)
    return cleaned
  }
  for (let n = 2; n < 100; n++) {
    const suffix = ` (${n})`
    const candidate = `${cleaned.slice(0, 31 - suffix.length)}${suffix}`
    if (!taken.has(candidate)) {
      taken.add(candidate)
      return candidate
    }
  }
  const fallback = cleaned.slice(0, 25) + Math.random().toString(36).slice(2, 7)
  taken.add(fallback)
  return fallback
}

function autoWidth(sheet: ExcelJS.Worksheet, columnCount: number) {
  for (let i = 1; i <= columnCount; i++) {
    const column = sheet.getColumn(i)
    let longest = 12
    column.eachCell({ includeEmpty: false }, (cell) => {
      const length = String(cell.value ?? '').length
      if (length > longest) longest = length
    })
    column.width = Math.min(Math.max(longest + 2, 14), 70)
  }
}

export async function renderXlsx(doc: Doc): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MarketPilot AI'
  workbook.created = new Date(doc.generatedAt)

  const taken = new Set<string>()
  const summary = workbook.addWorksheet(sheetName('Report', taken), {
    views: [{ state: 'frozen', ySplit: 4 }],
  })

  summary.mergeCells('A1:D1')
  const titleCell = summary.getCell('A1')
  titleCell.value = doc.title
  titleCell.font = { bold: true, size: 16, color: { argb: INK } }

  summary.mergeCells('A2:D2')
  summary.getCell('A2').value = doc.subtitle
  summary.getCell('A2').font = { size: 11, color: { argb: MUTED } }

  summary.mergeCells('A3:D3')
  summary.getCell('A3').value = `Generated ${new Date(doc.generatedAt).toLocaleString('en-US')}`
  summary.getCell('A3').font = { size: 10, color: { argb: MUTED } }

  let row = 5

  const writeSummaryBlock = (block: DocBlock) => {
    switch (block.type) {
      case 'heading': {
        row += 1
        const cell = summary.getCell(row, 1)
        cell.value = block.text.toUpperCase()
        cell.font = { bold: true, size: 12, color: { argb: ACCENT } }
        row += 1
        break
      }
      case 'subheading': {
        const cell = summary.getCell(row, 1)
        cell.value = block.text
        cell.font = { bold: true, size: 10, color: { argb: INK } }
        row += 1
        break
      }
      case 'paragraph': {
        summary.mergeCells(row, 1, row, 4)
        const cell = summary.getCell(row, 1)
        cell.value = block.text
        cell.alignment = { wrapText: true, vertical: 'top' }
        cell.font = { size: 10, color: { argb: INK } }
        summary.getRow(row).height = Math.min(120, 14 + block.text.length / 6)
        row += 2
        break
      }
      case 'bullets': {
        for (const item of block.items) {
          summary.mergeCells(row, 1, row, 4)
          const cell = summary.getCell(row, 1)
          cell.value = `•  ${item}`
          cell.alignment = { wrapText: true, vertical: 'top' }
          cell.font = { size: 10, color: { argb: INK } }
          summary.getRow(row).height = Math.min(90, 14 + item.length / 8)
          row += 1
        }
        row += 1
        break
      }
      case 'kv': {
        for (const item of block.items) {
          const label = summary.getCell(row, 1)
          label.value = item.label
          label.font = { bold: true, size: 9, color: { argb: MUTED } }
          label.alignment = { vertical: 'top' }

          summary.mergeCells(row, 2, row, 4)
          const value = summary.getCell(row, 2)
          value.value = item.value
          value.alignment = { wrapText: true, vertical: 'top' }
          value.font = { size: 10, color: { argb: INK } }
          summary.getRow(row).height = Math.min(90, 14 + item.value.length / 9)
          row += 1
        }
        row += 1
        break
      }
      case 'scores': {
        const labels = summary.getRow(row)
        const values = summary.getRow(row + 1)
        block.items.forEach((item, index) => {
          const labelCell = labels.getCell(index + 1)
          labelCell.value = item.label
          labelCell.font = { bold: true, size: 8, color: { argb: MUTED } }
          labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND } }

          const valueCell = values.getCell(index + 1)
          valueCell.value = item.value === null ? 'n/a' : item.value
          valueCell.font = { bold: true, size: 16, color: { argb: item.value === null ? MUTED : ACCENT } }
          valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND } }
        })
        row += 3
        break
      }
      case 'table':
        // Tables get their own sheet — see below.
        break
    }
  }

  doc.blocks.forEach(writeSummaryBlock)

  summary.getColumn(1).width = 28
  summary.getColumn(2).width = 34
  summary.getColumn(3).width = 34
  summary.getColumn(4).width = 34

  // Each table becomes a filterable sheet — that is the reason to want Excel at all.
  for (const block of doc.blocks) {
    if (block.type !== 'table' || !block.rows.length) continue

    const sheet = workbook.addWorksheet(sheetName(block.name, taken), {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    const header = sheet.addRow(block.columns)
    header.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: MUTED } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND } }
      cell.alignment = { vertical: 'middle', wrapText: true }
    })
    header.height = 22

    for (const row of block.rows) {
      const added = sheet.addRow(block.columns.map((_, index) => row[index] ?? ''))
      added.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: 'top' }
        cell.font = { size: 10, color: { argb: INK } }
      })
    }

    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: block.columns.length },
    }
    autoWidth(sheet, block.columns.length)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
