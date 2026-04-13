import fs from 'node:fs'
import https from 'node:https'
import readline from 'node:readline'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CSV_URL = 'https://raw.githubusercontent.com/alanwillms/geoinfo/master/latitude-longitude-bairros.csv'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(scriptDir, '../public/data')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'neighborhoods.json')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

console.log('--- Iniciando download e processamento de bairros ---')

https.get(CSV_URL, (res) => {
  const rl = readline.createInterface({
    input: res,
    terminal: false
  })

  const neighborhoods = []
  let isHeader = true

  rl.on('line', (line) => {
    if (isHeader) {
      isHeader = false
      return
    }

    const parts = line.split(';').map(p => p.replace(/^"|"$/g, '').trim())
    
    if (parts.length >= 7) {
      const uf = parts[2]
      const city = parts[3]
      const neighborhood = parts[4]
      const lng = parseFloat(parts[5])
      const lat = parseFloat(parts[6])
      
      if (uf && city && neighborhood && !isNaN(lat) && !isNaN(lng)) {
        neighborhoods.push([neighborhood, city, uf, lat, lng])
      }
    }
  })

  rl.on('close', () => {
    console.log(`--- Processados ${neighborhoods.length} bairros ---`)
    console.log('--- Salvando JSON... ---')
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(neighborhoods))
    
    const sizeMB = (fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2)
    console.log(`--- Sucesso! Arquivo gerado em ${OUTPUT_FILE} (${sizeMB} MB) ---`)
  })

}).on('error', (err) => {
  console.error('Erro no download:', err.message)
  process.exit(1)
})
