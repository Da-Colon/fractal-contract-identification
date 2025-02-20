import PDFDocument from "pdfkit";
import fs from "fs";

// Define data types
interface NetworkTotal {
  Network: string;
  "Total Daos": number;
  "Total Treasury": string;
  "Total Multisigs": number;
  "Total Azorius": number;
  "Total Unique Users": number;
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
  "Proposal Count": number;
  "Unique Users": number;
  "Votes Count": number;
  [key: string]: string | number; // Strategies are dynamic
}

interface ReportData {
  networkTotals: NetworkTotal[];
  overalTotals: FormattedOveralTotal[];
  daoData: DaoData[];
}

// Function to generate a timestamped file name
function getTimestampedFileName(baseName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0]; // Remove milliseconds
  return `reports/${timestamp}_${baseName}.pdf`;
}

// Function to ensure "reports/" directory exists
async function ensureReportsDirectory() {
  const reportsDir = "reports";
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

// Function to generate the DAO report with fixed tables
export async function generateDAOReport(reportData: ReportData) {
  await ensureReportsDirectory();
  const outputFile = getTimestampedFileName("DAO_Report");
  const doc = new PDFDocument({ margin: 40 });

  const stream = fs.createWriteStream(outputFile);
  doc.pipe(stream);

  // Title
  doc.fontSize(20).text("DAO Report", { align: "center" });
  doc.moveDown(1);

  // Summary
  doc.fontSize(14).text("Summary:", { underline: true });
  doc.moveDown(0.5);
  generateSummaryTable(doc, reportData.overalTotals);
  doc.moveDown(1);

  // Network Totals
  doc.fontSize(14).text("Network Totals:", { underline: true });
  doc.moveDown(0.5);
  generateTable(
    doc,
    reportData.networkTotals,
    Object.keys(reportData.networkTotals[0]),
    new Array(Object.keys(reportData.networkTotals[0]).length).fill(80),
  );
  doc.moveDown(1);

  // DAO Data
  doc.fontSize(14).text("DAO Data:");
  doc.text("", { underline: true });
  doc.moveDown(0.5);
  generateTable(
    doc,
    reportData.daoData,
    Object.keys(reportData.daoData[0]),
    new Array(Object.keys(reportData.daoData[0]).length).fill(100),
  );
  doc.moveDown(1);

  doc.end(); // Finalize the document
  console.log(`PDF Report Generated: ${outputFile}`);
}

// Function to generate summary table for overalTotals
function generateSummaryTable(doc: PDFKit.PDFDocument, summaryData: FormattedOveralTotal[]) {
  const rowHeight = 20;
  let y = doc.y;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Metric", 50, y, { width: 180 });
  doc.text("Value", 230, y, { width: 250 });
  y += rowHeight;
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(9);
  summaryData.forEach(({ Metric, Value }) => {
    doc.text(Metric, 50, y, { width: 180 });
    doc.text(Value.toString(), 230, y, { width: 250 });
    y += rowHeight;
    doc.moveDown(0.5);
  });
}

// Function to create a table with fixed column widths and page wrapping
function generateTable(
  doc: PDFKit.PDFDocument,
  tableData: any[],
  headers: string[],
  colWidths: number[],
) {
  const rowHeight = 20;
  let y = doc.y;

  // Function to check if the page should break
  function checkPageBreak() {
    if (y + rowHeight > doc.page.height - 40) {
      doc.addPage();
      y = doc.y;
    }
  }

  // Table Headers
  doc.font("Helvetica-Bold").fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
      width: colWidths[i],
    });
  });
  y += rowHeight;
  doc.moveDown(0.5);

  // Table Rows
  doc.font("Helvetica").fontSize(9);
  tableData.forEach((row) => {
    checkPageBreak();
    headers.forEach((header, i) => {
      const value = typeof row === "object" ? row[header] : row[1];
      doc.text(value?.toString() ?? "", 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: colWidths[i],
      });
    });
    y += rowHeight;
    doc.moveDown(0.5);
  });
}
