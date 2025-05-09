import { Buffer } from "buffer";
import * as path from "path";

const PDFDocument = require("pdfkit");

// 54-digits barcode finish standart
export function generateVirtualBarcode({
  iban,
  amount,
  reference,
  dueDate,
}: {
  iban: string;
  amount: number;
  reference: string;
  dueDate: Date;
}): string {
  const ibanDigits = convertIbanToDigits(iban);
  const amountCents = Math.round(amount * 100)
    .toString()
    .padStart(8, "0");
  const ref = reference.replace(/\s/g, "").padStart(20, "0");

  const dateStr = dueDate
    ? dueDate
        .toISOString()
        .slice(2, 10) // yy-mm-dd
        .replace(/-/g, "")
    : "00000000";

  return `4${ibanDigits}${amountCents}${ref}${dateStr}`;
}

// Create barcode picture with bwip-js library
export async function generateBarcodeImage(data: string): Promise<Buffer> {
  const bwipjs = require("bwip-js");
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "interleaved2of5",
        text: data,
        scale: 3,
        height: 10,
        includetext: false,
      },
      (err: Error, png: Buffer) => {
        if (err) reject(err);
        else resolve(png);
      },
    );
  });
}

interface GenerateInvoicePDFOptions {
  invoiceNumber: string;
  user: any;
  items: any[];
  total: number;
  vatAmount: number;
  barcodeImage: Buffer;
  referenceNumber: string;
  dueDate: Date;
}

export async function generateInvoicePDF({
  invoiceNumber,
  user,
  items,
  total,
  vatAmount,
  barcodeImage,
  referenceNumber,
  dueDate,
}: GenerateInvoicePDFOptions): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  // === LOGO ===

  const logoPath = path.join(__dirname, "..", "..", "assets", "logo1.png");
  doc.image(logoPath, 50, 45, { width: 100 });

  // === HEADER ===
  doc.fontSize(20).text("Invoice", 200, 50, { align: "right" });

  doc
    .moveDown()
    .fontSize(12)
    .text(`Invoice Number: ${invoiceNumber}`)
    .text(`Reference Number: ${referenceNumber}`)
    .text(`Due Date: ${dueDate.toISOString().split("T")[0]}`)
    .text(`Customer: ${user.full_name || user.email}`);

  // === ITEMS ===
  doc.moveDown().fontSize(12).text("Items", { underline: true });
  items.forEach((item, index) => {
    const name = item.storage_items?.translations.fi.name || "Item";
    const qty = item.quantity || 1;
    const price = item.price || 0;
    doc.text(
      `${index + 1}. ${name} - Qty: ${qty} x €${price.toFixed(2)} = €${(qty * price).toFixed(2)}`,
    );
  });

  // === TOTALS ===
  doc
    .moveDown()
    .text(`Subtotal: €${(total - vatAmount).toFixed(2)}`)
    .text(`VAT (24%): €${vatAmount.toFixed(2)}`)
    .text(`Total: €${total.toFixed(2)}`);

  // === BARCODE on first page ===
  doc.moveDown().moveDown();
  doc.fontSize(14).text("Maksuviivakoodi", { align: "center" });
  doc.image(barcodeImage, {
    fit: [300, 50],
    align: "center",
    valign: "bottom",
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

export function generateFinnishReferenceNumber(base: string): string {
  const digits = base.replace(/\D/g, "") + "0";
  const weights = [7, 3, 1];
  let sum = 0;

  for (let i = digits.length - 2, w = 0; i >= 0; i--, w = (w + 1) % 3) {
    sum += parseInt(digits[i], 10) * weights[w];
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return digits.slice(0, -1) + checkDigit;
}

// format IBAN to standard number
function convertIbanToDigits(iban: string): string {
  return iban
    .toUpperCase()
    .replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString())
    .replace(/\s+/g, "")
    .replace(/[^0-9]/g, "")
    .padStart(16, "0")
    .slice(0, 16);
}
