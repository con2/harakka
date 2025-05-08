# Setup PDF invoicing

## pdfs

for the creation we use pdfkit
install dependencies:

```bash
npm install bwip-js pdfkit
```

## invoicing

setup helperfunctions in utils

```ts
const invoiceNumber = `INV-${Date.now()}`; // nicht eindeutig
const referenceNumber = generateFinnishReferenceNumber(invoiceNumber); // wird aus der einen nr ne andere gemacht
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 14); // 14 Tage Zahlungsfrist

// Simpler Preis-Rechner (hier z.B. quantity * 10€)
const totalAmount = items.reduce((sum, item) => sum + item.quantity * 10, 0);
const vatAmount = totalAmount * 0.24; // 24 % MwSt.

const virtualBarcode = generateVirtualBarcode({
  iban: "FI21 1234 5600 0007 85", // <- dein echtes IBAN einsetzen
  amount: totalAmount,
  reference: referenceNumber,
  dueDate,
});

const barcodeImage = await generateBarcodeImage(virtualBarcode);

// USER-Daten holen
const { data: user, error: userError } = await supabase
  .from("user_profiles")
  .select("email")
  .eq("id", userId)
  .single();

if (userError || !user) {
  throw new BadRequestException("User not found");
}

const pdfBuffer = await generateInvoicePDF({
  invoiceNumber,
  user,
  items,
  total: totalAmount,
  vatAmount,
  barcodeImage,
  referenceNumber,
  dueDate,
});

const filename = `invoices/invoice-${orderId}-${Date.now()}.pdf`;
const { data, error } = await supabase.storage
  .from("invoices")
  .upload(filename, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

/*  const { error: uploadError } = await this.supabaseService
      .getStorageClient()
      .from("invoices")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      }); */

if (error) {
  throw new BadRequestException("Could not upload invoice PDF");
}

const { data: publicURL } = await supabase.storage
  .from("invoices")
  .getPublicUrl(filename);

// 4.5.1 Insert invoice data into invoices table
const { error: invoiceInsertError } = await supabase.from("invoices").insert({
  invoice_number: invoiceNumber,
  order_id: orderId,
  user_id: userId,
  due_date: dueDate.toISOString(),
  reference_number: referenceNumber,
  total_amount: totalAmount,
  pdf_url: publicURL,
});

if (invoiceInsertError) {
  throw new BadRequestException("Could not save invoice record");
}
```
