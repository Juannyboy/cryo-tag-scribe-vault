
import jsPDF from "jspdf";

// Interface definition for decantor records
export interface DecanterRecord {
  id: string;
  date: string;
  requester: string;
  department: string;
  purchaseOrder: string;
  amount: string;
  representative: string;
  requesterRepresentative: string;
}

/**
 * Generates a PDF document based on the liquid nitrogen decanting record
 * 
 * @param record The decanting record to generate PDF for
 */
export const generatePDF = (record: DecanterRecord) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set font
  doc.setFont("helvetica", "normal");
  
  // Add header
  doc.setFontSize(10);
  doc.text("FARMOVS (Pty) Ltd. (Reg. No. 2000/003345/07)", 110, 15, { align: "right" });
  doc.text("Private Bag X09", 110, 20, { align: "right" });
  doc.text("Brandhof", 110, 25, { align: "right" });
  doc.text("9324", 110, 30, { align: "right" });
  doc.text("Telephone: +27 (0) 51 410 3111", 110, 35, { align: "right" });
  doc.text("Facsimile: +27 (0) 51 4101352", 110, 40, { align: "right" });
  doc.text("VAT. Reg. No.: 4490196249", 110, 45, { align: "right" });

  // Add FARMOVS logo 
  // In a real implementation, we would load the actual logo
  try {
    doc.addImage("/farmovs-logo.svg", "SVG", 20, 15, 90, 30);
  } catch (error) {
    // Fallback if image loading fails
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FARMOVS", 20, 30);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Integrated research solutions", 20, 37);
  }
  
  // Add horizontal line
  doc.line(20, 50, 190, 50);

  // Add title
  doc.setFontSize(16);
  doc.setFont("courier", "bold");
  doc.text("Liquid Nitrogen Decant Form", 105, 65, { align: "center" });
  
  // Add decanting number
  doc.setFontSize(12);
  doc.text("Decanting Number:", 20, 80);
  doc.setFont("courier", "bold");
  doc.text(record.id, 70, 80);
  doc.setFont("courier", "normal");
  
  // Create table structure
  const startY = 90;
  const lineHeight = 20;
  
  // Format
  doc.rect(20, startY, 170, lineHeight);
  doc.text("Date of decanting:", 25, startY + 13);
  doc.text(record.date, 130, startY + 13);
  
  doc.rect(20, startY + lineHeight, 170, lineHeight);
  doc.text("Requestor:", 25, startY + lineHeight + 13);
  doc.text(record.department, 130, startY + lineHeight + 13);
  
  doc.rect(20, startY + lineHeight * 2, 170, lineHeight);
  doc.text("Purchase-Order Number:", 25, startY + lineHeight * 2 + 13);
  doc.text(record.purchaseOrder, 130, startY + lineHeight * 2 + 13);
  
  doc.rect(20, startY + lineHeight * 3, 170, lineHeight);
  doc.text("Liquid nitrogen decanted:", 25, startY + lineHeight * 3 + 13);
  doc.text(record.amount, 130, startY + lineHeight * 3 + 13);
  
  // Signature blocks
  const sigY = startY + lineHeight * 4 + 10;
  
  // FARMOVS Representative signature block
  doc.rect(20, sigY, 80, 30);
  doc.text("FARMOVS Representative Signature:", 25, sigY + 7);

  // Requestor Representative signature block
  doc.rect(110, sigY, 80, 30);
  doc.text("Requestor Representative Signature:", 115, sigY + 7);

  // Names blocks
  const nameY = sigY + 40;

  // FARMOVS Representative name block
  doc.rect(20, nameY, 80, 30);
  doc.text("FARMOVS Representative Name:", 25, nameY + 7);
  doc.text(record.representative, 60, nameY + 20);
  
  // Requestor Representative name block
  doc.rect(110, nameY, 80, 30);
  doc.text("Requestor Representative Name:", 115, nameY + 7);
  doc.text(record.requesterRepresentative, 150, nameY + 20);

  // Date blocks
  const dateY = nameY + 40;

  // FARMOVS Date block
  doc.rect(20, dateY, 80, 30);
  doc.text("Date:", 60, dateY + 7, { align: "center" });
  doc.text(record.date, 60, dateY + 20, { align: "center" });
  
  // Requestor Date block
  doc.rect(110, dateY, 80, 30);
  doc.text("Date:", 150, dateY + 7, { align: "center" });
  doc.text(record.date, 150, dateY + 20, { align: "center" });
  
  // Final note
  doc.setTextColor(255, 0, 0);
  doc.text("Please make sure dewars are present before 09:00 on Tuesdays", 105, dateY + 50, { align: "center" });
  doc.text("and Thursdays", 105, dateY + 58, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  // Save the PDF
  doc.save(`Liquid_Nitrogen_Decant_${record.id}.pdf`);
};
