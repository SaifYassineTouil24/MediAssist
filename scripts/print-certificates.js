import { neon } from "@neondatabase/serverless"
import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"

/**
 * Script to print medical certificates to PDF
 * Usage: node scripts/print-certificates.js
 */

const sql = neon(process.env.DATABASE_URL)

async function getCertificates() {
  try {
    console.log("[v0] Fetching certificates from database...")
    const certificates = await sql`
      SELECT id, ID_CM, start_date, end_date, content, ID_patient
      FROM certificates
      ORDER BY created_at DESC
      LIMIT 10
    `

    console.log(`[v0] Found ${certificates.length} certificates`)
    return certificates
  } catch (error) {
    console.error("[v0] Error fetching certificates:", error)
    throw error
  }
}

async function generateCertificatePDF(certificate) {
  try {
    console.log(`[v0] Generating PDF for certificate ${certificate.ID_CM}...`)

    const startDate = new Date(certificate.start_date).toLocaleDateString("fr-FR")
    const endDate = new Date(certificate.end_date).toLocaleDateString("fr-FR")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificat Médical - ${certificate.ID_CM}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: white;
              color: #333;
            }
            .certificate {
              border: 3px solid #1a3a52;
              padding: 40px;
              text-align: center;
              max-width: 800px;
              margin: 0 auto;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              background: white;
            }
            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #1a3a52;
              padding-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1a3a52;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .dates {
              margin: 30px 0;
              font-size: 14px;
              background: #f5f5f5;
              padding: 15px;
              border-left: 4px solid #1a3a52;
            }
            .dates strong {
              color: #1a3a52;
            }
            .content {
              text-align: left;
              margin: 30px 0;
              line-height: 1.8;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-size: 14px;
              padding: 20px;
              background: #fafafa;
              border-radius: 4px;
            }
            .footer {
              margin-top: 40px;
              border-top: 2px solid #1a3a52;
              padding-top: 20px;
              font-size: 11px;
              color: #666;
            }
            .metadata {
              font-size: 10px;
              color: #999;
              margin-top: 10px;
              text-align: right;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">Certificat Médical</div>
              <div class="subtitle">Document Officiel</div>
            </div>
            
            <div class="dates">
              <strong>Période de validité:</strong> ${startDate} à ${endDate}
              <br/>
              <strong>Durée:</strong> ${Math.ceil(
                (new Date(certificate.end_date).getTime() - new Date(certificate.start_date).getTime()) /
                  (1000 * 60 * 60 * 24),
              )} jours
            </div>

            <div class="content">
${certificate.content}
            </div>

            <div class="footer">
              <p>Certificat généré automatiquement par le système de gestion médicale MediAssist</p>
              <div class="metadata">
                ID Certificat: ${certificate.ID_CM} | Patient ID: ${certificate.ID_patient}
                <br/>
                Généré le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const outputDir = "./certificates_pdf"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = path.join(outputDir, `certificate_${certificate.ID_CM}_${Date.now()}.pdf`)
    await page.pdf({
      path: filename,
      format: "A4",
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    })

    await browser.close()

    console.log(`[v0] PDF generated successfully: ${filename}`)
    return filename
  } catch (error) {
    console.error(`[v0] Error generating PDF for certificate ${certificate.ID_CM}:`, error)
    throw error
  }
}

async function main() {
  try {
    console.log("[v0] Starting certificate printing script...")
    console.log("[v0] Database URL:", process.env.DATABASE_URL ? "Connected" : "Not configured")

    const certificates = await getCertificates()

    if (certificates.length === 0) {
      console.log("[v0] No certificates found to print")
      return
    }

    const results = []
    for (const cert of certificates) {
      try {
        const pdfPath = await generateCertificatePDF(cert)
        results.push({ success: true, id: cert.ID_CM, path: pdfPath })
        console.log(`[v0] ✓ Certificate ${cert.ID_CM} printed successfully`)
      } catch (error) {
        results.push({ success: false, id: cert.ID_CM, error: error.message })
        console.error(`[v0] ✗ Failed to print certificate ${cert.ID_CM}`)
      }
    }

    console.log("\n[v0] Print Summary:")
    console.log(`[v0] Total: ${results.length}`)
    console.log(`[v0] Successful: ${results.filter((r) => r.success).length}`)
    console.log(`[v0] Failed: ${results.filter((r) => !r.success).length}`)

    process.exit(0)
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    process.exit(1)
  }
}

main()
