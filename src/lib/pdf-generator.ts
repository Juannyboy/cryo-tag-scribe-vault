
import jsPDF from "jspdf";
import { DecanterRecord } from "@/types/decanter";

export const generatePDF = (record: DecanterRecord) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set font
  doc.setFont("helvetica", "normal");
  
  // Add header with proper spacing
  doc.setFontSize(8);
  doc.text("FARMOVS (Pty) Ltd. (Reg. No. 2000/003345/07)", 190, 15, { align: "right" });
  doc.text("Private Bag X09", 190, 20, { align: "right" });
  doc.text("Brandhof", 190, 25, { align: "right" });
  doc.text("9324", 190, 30, { align: "right" });
  doc.text("Telephone: +27 (0) 51 410 3111", 190, 35, { align: "right" });
  doc.text("Facsimile: +27 (0) 51 4101352", 190, 40, { align: "right" });
  doc.text("VAT. Reg. No.: 4490196249", 190, 45, { align: "right" });

  // Add FARMOVS logo with proper positioning
  try {
    doc.addImage("/farmovs-logo.svg", "SVG", 15, 15, 80, 25);
  } catch (error) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FARMOVS", 15, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Integrated research solutions", 15, 32);
  }
  
  // Add horizontal line
  doc.line(15, 50, 195, 50);

  // Add title with proper spacing
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Liquid Nitrogen Decant Form", 105, 65, { align: "center" });
  
  // Add scan date (new)
  const scanDate = new Date();
  const formattedScanDate = `${scanDate.getDate()}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][scanDate.getMonth()]}-${String(scanDate.getFullYear()).slice(2)}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Scan Date:", 15, 75);
  doc.setFont("helvetica", "bold");
  doc.text(formattedScanDate, 40, 75);
  doc.setFont("helvetica", "normal");
  
  // Add decanting number
  doc.text("Decanting Number:", 15, 85);
  doc.setFont("helvetica", "bold");
  doc.text(record.id, 50, 85);
  doc.setFont("helvetica", "normal");
  
  // Create table structure with proper spacing
  const startY = 95;
  const lineHeight = 15;
  const colWidth = 180;
  const labelX = 20;
  const valueX = 100;
  
  // Format fields with proper spacing
  const addField = (label: string, value: string, y: number) => {
    doc.rect(15, y, colWidth, lineHeight);
    doc.text(label, labelX, y + 10);
    doc.text(value, valueX, y + 10);
  };
  
  addField("Date of decanting:", record.date, startY);
  addField("Requestor:", record.requester, startY + lineHeight);
  addField("Purchase-Order Number:", record.purchaseOrder, startY + lineHeight * 2);
  addField("Liquid nitrogen decanted:", record.amount, startY + lineHeight * 3);
  
  // Signature blocks with proper spacing
  const sigY = startY + lineHeight * 4 + 10;
  const blockWidth = 85;
  const sigHeight = 25;
  
  // Left signature block
  doc.rect(15, sigY, blockWidth, sigHeight);
  doc.text("FARMOVS Representative", 20, sigY + 7);
  doc.text("Signature:", 20, sigY + 15);

  // Right signature block
  doc.rect(110, sigY, blockWidth, sigHeight);
  doc.text("Requestor Representative", 115, sigY + 7);
  doc.text("Signature:", 115, sigY + 15);

  // Names blocks
  const nameY = sigY + 35;

  // Left name block
  doc.rect(15, nameY, blockWidth, sigHeight);
  doc.text("FARMOVS Representative Name:", 20, nameY + 7);
  doc.text(record.representative, 20, nameY + 20);
  
  // Right name block
  doc.rect(110, nameY, blockWidth, sigHeight);
  doc.text("Requestor Representative Name:", 115, nameY + 7);
  doc.text(record.requesterRepresentative, 115, nameY + 20);

  // Date blocks
  const dateY = nameY + 35;

  // Left date block
  doc.rect(15, dateY, blockWidth, sigHeight);
  doc.text("Date:", 57.5, dateY + 7, { align: "center" });
  doc.text(record.date, 57.5, dateY + 20, { align: "center" });
  
  // Right date block
  doc.rect(110, dateY, blockWidth, sigHeight);
  doc.text("Date:", 152.5, dateY + 7, { align: "center" });
  doc.text(record.date, 152.5, dateY + 20, { align: "center" });
  
  // Final note with proper spacing and red color
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(10);
  doc.text("Please make sure dewars are present before 09:00 on Tuesdays", 105, dateY + 45, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  // Save the PDF
  doc.save(`Liquid_Nitrogen_Decant_${record.id}.pdf`);
};
