import bwipjs from "bwip-js";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

export async function generateBarcodeImage(data: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text: data,
        scale: 3,
        height: 10,
        includetext: false,
      },
      (err, png) => {
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

  doc.fontSize(20).text("Invoice", { align: "center" });

  doc
    .moveDown()
    .fontSize(12)
    .text(`Invoice Number: ${invoiceNumber}`)
    .text(`Reference Number: ${referenceNumber}`)
    .text(`Due Date: ${dueDate.toISOString().split("T")[0]}`)
    .text(`Customer: ${user.name || user.email}`);

  doc.moveDown().text("Items:");

  items.forEach((item, index) => {
    const name = item.storage_items?.name || "Item";
    doc.text(`${index + 1}. ${name}`);
  });

  doc
    .moveDown()
    .text(`Subtotal: €${(total - vatAmount).toFixed(2)}`)
    .text(`VAT (24%): €${vatAmount.toFixed(2)}`)
    .text(`Total: €${total.toFixed(2)}`);

  doc.addPage();
  doc.image(barcodeImage, {
    fit: [300, 100],
    align: "center",
    valign: "center",
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

export function generateVirtualBarcode({ iban, amount, reference, dueDate }) {
  const cents = (amount * 100).toFixed(0).padStart(8, "0");
  const date = `${dueDate.getFullYear().toString().slice(2)}${(
    dueDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${dueDate.getDate().toString().padStart(2, "0")}`;

  return `4${iban.replace(/\s/g, "")}${cents}${reference.padStart(20, "0")}${date}`;
}
