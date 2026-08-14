/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This repo holds several projects; pin tracing to this app so Next does not
  // walk up to an unrelated lockfile.
  outputFileTracingRoot: __dirname,
  // better-sqlite3 is native; pdfkit/exceljs/pptxgenjs read bundled assets at
  // runtime (fonts, templates) and break when traced into the server bundle.
  serverExternalPackages: ['better-sqlite3', 'pdfkit', 'exceljs', 'pptxgenjs'],
}

module.exports = nextConfig
