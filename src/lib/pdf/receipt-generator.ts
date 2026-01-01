import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ReceiptData {
  bookingId: string;
  courtName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  totalAmount: number;
  userName: string;
}

export const generateReceiptPDF = (data: ReceiptData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("COURTLY", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Premium Sports Court Booking", 105, 28, { align: "center" });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);

  // Receipt Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt ID: #${data.bookingId.slice(0, 8).toUpperCase()}`, 20, 45);
  doc.text(`Date: ${format(new Date(), "PPP")}`, 190, 45, { align: "right" });

  doc.text(`Billed To:`, 20, 55);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text(data.userName, 20, 62);

  // Table
  autoTable(doc, {
    startY: 75,
    head: [["Description", "Details"]],
    body: [
      ["Court", data.courtName],
      ["Sport", data.sport],
      ["Booking Date", format(new Date(data.date), "PPP")],
      ["Time", `${data.startTime} - ${data.endTime}`],
      ["Rate", `$${data.pricePerHour}/hr`],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] }, // Blue-500
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Total
  const finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY || 120;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Paid:`, 140, finalY + 20);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`$${data.totalAmount.toFixed(2)}`, 190, finalY + 20, {
    align: "right",
  });

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing Courtly!", 105, 280, { align: "center" });
  doc.text("This is a computer generated receipt.", 105, 285, {
    align: "center",
  });

  // Save
  doc.save(`courtly-receipt-${data.bookingId.slice(0, 8)}.pdf`);
};
