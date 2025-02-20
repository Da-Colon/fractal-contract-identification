import PDFDocument from "pdfkit";
import fs from "fs";
import { createAddressSubstring } from "./helpers.common";

// Define data types
interface NetworkTotal {
  Network: string;
  "Total Daos": number;
  "Total Treasury": string;
  "Total Multisigs": number;
  "Total Azorius": number;
  "Total Users": number;
  "Total Votes": number;
  "Total Proposals": number;
}

interface FormattedOveralTotal {
  Metric: string;
  Value: string | number;
}

interface DaoData {
  "Dao Address": string;
  "Total Treasury": string;
  "Dao Name": string;
  Governance: string;
  Network: string;
  Proposals: number;
  "Unique Users": number;
  "# Votes": number;
  [key: string]: string | number; // Strategies are dynamic
}

interface ReportData {
  networkTotals: NetworkTotal[];
  overalTotals: FormattedOveralTotal[];
  daoData: DaoData[];
}

// Function to generate a timestamped file name
function getTimestampedFileName(baseName: string): string {
  const now = new Date();
  const formattedTimestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  return `reports/${formattedTimestamp}_${baseName}.pdf`;
}

// Function to ensure "reports/" directory exists
async function ensureReportsDirectory() {
  const reportsDir = "reports";
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

class DocModifier {
  constructor(private doc: PDFKit.PDFDocument) {}

  // Method to add a header with better spacing
  setLabelFont() {
    this.doc.font("Helvetica-Bold").fontSize(8).fillColor("black");
  }
  setValueFont() {
    this.doc.font("Helvetica").fontSize(8).fillColor("blue");
  }

  drawBorder() {
    const { width, height } = this.doc.page;
    const borderPadding = 10; // Distance from edge
    const borderPadding2 = 5; // Distance from edge
    this.doc
      .rect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2)
      .stroke();
    this.doc
      .rect(borderPadding2, borderPadding2, width - borderPadding2 * 2, height - borderPadding2 * 2)
      .stroke();
  }

  reset() {
    this.doc.font("Helvetica").fontSize(12).fillColor("black");
    this.doc.x = 32; // Reset x position
    this.doc.opacity(1);
  }
}

// Function to generate the DAO report with better spacing and alignment
export async function generateDAOReport(reportData: ReportData, networkFilter: string) {
  await ensureReportsDirectory();
  const outputFile = getTimestampedFileName(networkFilter);
  const doc = new PDFDocument({ margins: { top: 24, left: 32, right: 32, bottom: 24 } });
  const docModifier = new DocModifier(doc);

  const stream = fs.createWriteStream(outputFile);
  doc.pipe(stream);

  docModifier.drawBorder();
  // Title
  doc.fontSize(22).text("Decent dApp report", { align: "center" });
  doc.fontSize(6).text(new Date().toLocaleString(), { align: "center" });
  doc.moveDown();
  // Summary
  doc.fontSize(12).text("Summary:", { underline: true });
  generateSummaryTable(doc, reportData.overalTotals);
  docModifier.reset();
  doc.moveDown(1);
  // Network Totals
  doc.fontSize(12).text("Network Totals:", { underline: true, align: "left" });
  doc.moveDown(0.5);
  generateTable(
    doc,
    reportData.networkTotals,
    Object.keys(reportData.networkTotals[0]),
    [64, 64, 80, 64, 64, 64, 64],
    15,
  );
  // DAO Data
  docModifier.reset();
  doc.moveDown(1);
  doc.fontSize(12).text("DAO Data:");
  doc.moveDown(0.5);
  generateTable(
    doc,
    reportData.daoData,
    Object.keys(reportData.daoData[0]),
    [64, 64, 64, 64, 64, 64, 64, 40],
    10,
  );
  doc.moveDown(2);

  doc.end(); // Finalize the document
  console.log(`PDF Report Generated: ${outputFile}`);
}

// Function to generate summary table for overalTotals
function generateSummaryTable(doc: PDFKit.PDFDocument, summaryData: FormattedOveralTotal[]) {
  const docModifier = new DocModifier(doc);
  const x = doc.x;
  doc.moveDown(0.5);
  summaryData.forEach(({ Metric, Value }) => {
    docModifier.setLabelFont();
    doc.text(Metric, x + 16, doc.y, { underline: true });
    docModifier.setValueFont();
    doc.text(Value.toString(), x + 32);
    doc.moveDown(0.25);
  });
  docModifier.reset();
}

// Function to create a table with fixed column widths and page wrapping
function generateTable(
  doc: PDFKit.PDFDocument,
  tableData: any[],
  headers: string[],
  colWidths: number[],
  rowPadding: number,
) {
  const docModifier = new DocModifier(doc);
  const rowHeight = 20;
  let y = doc.y;
  const x = doc.x;

  // Function to check if the page should break
  function checkPageBreak(_rowHeight: number, _y: number) {
    if (_y + _rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  }
  // Table Headers
  docModifier.setLabelFont();
  headers.forEach((header, i) => {
    doc.text(header, x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + rowPadding, y, {
      width: colWidths[i],
      underline: true,
    });
  });
  y += rowHeight;
  doc.moveDown(1);

  // Table Rows
  tableData.forEach((row) => {
    checkPageBreak(rowHeight, y);
    headers.forEach((header, i) => {
      docModifier.reset();
      if (i > 0) {
        docModifier.setValueFont();
      } else {
        docModifier.setLabelFont();
      }
      const value = typeof row === "object" ? row[header] : row[1];
      if (value?.length > 41) {
        doc.text(
          createAddressSubstring(value),
          x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + rowPadding,
          y,
          {
            width: colWidths[i],
          },
        );
        doc
          .opacity(0)
          .text(
            value.toString(),
            x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + rowPadding,
            y,
            {
              lineBreak: false,
            },
          );
      } else {
        doc.text(
          value?.toString() ?? "",
          x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + rowPadding,
          y,
          {
            width: colWidths[i],
          },
        );
      }
    });
    y += rowHeight;
    doc.moveDown(1);
  });
}
