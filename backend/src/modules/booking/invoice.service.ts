import { SupabaseService } from "../supabase/supabase.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import {
  generateFinnishReferenceNumber,
  generateVirtualBarcode,
  generateBarcodeImage,
  generateInvoicePDF,
} from "../../utils/invoice-functions";

@Injectable()
export class InvoiceService {
  constructor(private readonly supabaseService: SupabaseService) {} // TODO refactor

  async generateInvoice(orderId: string): Promise<string> {
    const supabase = this.supabaseService.getServiceClient();

    // Load order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order || orderError) {
      throw new BadRequestException("Order not found");
    }

    // Load related order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("booking_items")
      .select("*, storage_items(*)") // only works if storage_items is a foreign key
      .eq("order_id", orderId);
    if (!orderItems || itemsError) {
      throw new BadRequestException("Order items not found");
    }

    // Load user
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", order.user_id)
      .single();
    if (!user || userError) {
      throw new BadRequestException("User not found");
    }

    // Generate invoice number + Viitenumero
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000, // different logic for invoice number generation
    )
      .toString()
      .padStart(4, "0")}`;
    const referenceNumber = generateFinnishReferenceNumber(invoiceNumber); // custom helper function
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Calculate price (dummy values here, dynamic later) // TODO: use real values
    const subtotal = 100; // e.g. from the item prices
    const vatRate = 0.24;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // Generate barcode (e.g. via bwip-js) // TODO: use bwip-js
    const barcodeString = generateVirtualBarcode({
      iban: "FI2112345600000785",
      amount: total,
      reference: referenceNumber,
      dueDate,
    });
    const barcodeImage = await generateBarcodeImage(barcodeString); // Buffer or Base64

    // Generate PDF with pdfkit
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      user: user,
      items: orderItems,
      total,
      vatAmount,
      barcodeImage,
      referenceNumber,
      dueDate,
    });

    // Upload to Supabase Storage or store URL
    const filePath = `invoices/${invoiceNumber}.pdf`;
    await supabase.storage.from("invoices").upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
    });

    await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      booking_id: order.id,
      user_id: order.user_id,
      reference_number: referenceNumber,
      total_amount: total,
      due_date: dueDate.toISOString().split("T")[0],
      pdf_url: filePath,
    });

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}
