export const printPDF = async (pdfUrl: string, documentName = "Document") => {
  try {
    // Fetch the PDF
    const response = await fetch(pdfUrl)
    const blob = await response.blob()

    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob)

    // Create an iframe for printing
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = blobUrl

    document.body.appendChild(iframe)

    // Wait for the iframe to load
    iframe.onload = () => {
      try {
        // Focus on the iframe and print
        iframe.contentWindow?.print()

        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe)
          URL.revokeObjectURL(blobUrl)
        }, 1000)
      } catch (error) {
        console.error("[v0] Error printing:", error)
        document.body.removeChild(iframe)
        URL.revokeObjectURL(blobUrl)
      }
    }

    iframe.onerror = () => {
      console.error("[v0] Error loading PDF for printing")
      document.body.removeChild(iframe)
      URL.revokeObjectURL(blobUrl)
    }
  } catch (error) {
    console.error("[v0] Error in printPDF:", error)
    // Fallback: open in new tab
    window.open(pdfUrl, "_blank")
  }
}

export const printContent = (elementId: string, documentName = "Document") => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`[v0] Element with id ${elementId} not found`)
    return
  }

  // Create a new window for printing
  const printWindow = window.open("", "", "width=800,height=600")
  if (!printWindow) {
    console.error("[v0] Could not open print window")
    return
  }

  // Get the element's HTML
  const content = element.innerHTML

  // Write the print document with centered content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${documentName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }
          
          .print-container {
            background: white;
            width: 210mm;
            height: 297mm;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-container {
              width: 100%;
              height: 100%;
              box-shadow: none;
              padding: 40px;
            }
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background-color: #f8f9fa;
            font-weight: 600;
          }
          
          h1, h2, h3 {
            margin: 15px 0;
            color: #333;
          }
          
          p {
            margin: 10px 0;
            line-height: 1.6;
            color: #555;
          }
          
          .header {
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .footer {
            border-top: 2px solid #007bff;
            padding-top: 20px;
            margin-top: 30px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${content}
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()

  // Trigger print dialog after content loads
  setTimeout(() => {
    printWindow.print()
  }, 250)
}
