import { SupabaseService } from "./supabase.service";
import { Injectable } from "@nestjs/common";
import {
  generateFinnishReferenceNumber,
  generateVirtualBarcode,
  generateBarcodeImage,
  generateInvoicePDF,
} from "../utils/invoice-functions";

@Injectable()
export class InvoiceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async generateInvoice(bookingId: string): Promise<Buffer> {
    const supabase = this.supabaseService.getServiceClient();

    // 1. Lade Booking, User, Items
    const { data: booking } = await supabase
      .from("orders")
      .select("*, order_items(*, storage_items(*)), user_profiles(*)")
      .eq("id", bookingId)
      .single();

    if (!booking) throw new Error("Booking not found");

    // 2. Generiere Rechnungsnummer + Viitenumero
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;
    const referenceNumber = generateFinnishReferenceNumber(invoiceNumber); // eigene Hilfsfunktion
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // 3. Berechne Preis (hier Dummy-Werte, später dynamisch)
    const subtotal = 100; // z. B. aus den Item-Preisen
    const vatRate = 0.24;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // 4. Barcode generieren (z. B. via bwip-js)
    const barcodeString = generateVirtualBarcode({
      iban: "FI2112345600000785",
      amount: total,
      reference: referenceNumber,
      dueDate,
    });
    const barcodeImage = await generateBarcodeImage(barcodeString); // Buffer or Base64

    // 5. PDF generieren (z. B. mit pdfkit)
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      user: booking.user_profiles,
      items: booking.order_items,
      total,
      vatAmount,
      barcodeImage,
      referenceNumber,
      dueDate,
    });

    // 6. Upload to Supabase Storage or store URL
    const filePath = `invoices/${invoiceNumber}.pdf`;
    await supabase.storage.from("invoices").upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
    });

    await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      booking_id: booking.id,
      user_id: booking.user_id,
      reference_number: referenceNumber,
      total_amount: total,
      due_date: dueDate.toISOString().split("T")[0],
      pdf_url: filePath,
    });

    return pdfBuffer;
  }
}
