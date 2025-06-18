# Setup PDF invoicing

## pdfs

for the creation we use pdfkit
install dependencies:

```bash
npm install bwip-js pdfkit
```

## invoicing

setup helperfunctions in utils
write invoice service file
and call the invoice service in booking confirmation

then set endpoints:

```ts
@Get(":orderId/generate") // unsafe - anyone can create files
  async generateInvoice(@Param("orderId") orderId: string) {
    const url = await this.invoiceService.generateInvoice(orderId);

    return url; // should not send url, becaause it is not a public url - will get new endpoint with auth and so on...
  }
```

and this one for watching the pdf invoice:

```ts
@Get("invoice/:orderId/pdf")
@UseGuards(AuthGuard) // make sure that the user is logged in
async getInvoicePdfUrl(
  @Param("orderId") orderId: string,
  @Req() req: RequestWithUser,
): Promise<string> {
  return this.invoiceService.getSignedInvoiceUrl(orderId, req.user);
}
```

# ToDo:

#### works, then continue with this one:

we have a private bucket in supabase and we create invoices that can be downloaded as pdfs.
they have a timewise limit so that they can only be downloaded for a certain time.
and we want to make sure that only certain users can access the pdf invoice, so that not every user can see other invoices.
admins should have access to all pdfs

what to do:

createSignedUrls combined with your own roles/permissions logic in the app

1. PDF is only available via backend route

   - never allow direct access to the Supabase storage URL in the frontend
   - instead, write a route like:

```ts
@Get("invoice/:orderId/pdf")
@UseGuards(AuthGuard) // Make sure user is logged in
async getInvoicePdfUrl(
  @Param("orderId") orderId: string,
  @Req() req: RequestWithUser,
): Promise<string> {
  return this.invoiceService.getSignedInvoiceUrl(orderId, req.user);
}
```

2. in invoice.service.ts we should change:

```ts
async getSignedInvoiceUrl(orderId: string, user: { id: string; role: string }): Promise<string> {
  const supabase = this.supabaseService.getServiceClient();

  // check if user is the same that created the order
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .single();

  if (!order || error) {
    throw new BadRequestException("Order not found");
  }

  // only owner or admin can see the PDF
  const isOwner = order.user_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new BadRequestException("You are not authorized to access this invoice");
  }

  const filePath = `invoices/INV-${orderId}.pdf`;

  const { data, error: urlError } = await supabase.storage
    .from("invoices")
    .createSignedUrl(filePath, 60 * 5); // available for 5 minutes --- or put more time

  if (!data?.signedUrl || urlError) {
    throw new BadRequestException("Failed to generate signed URL");
  }

  return data.signedUrl;
}
```

3. Make sure the auth works correctly
   with @UseGuards(AuthGuard) (JWT, session, Supabase client, etc.)

   Ensure that req.user.id and req.user.role are available

4. save the file correctly
   Make sure to save the file path in the database, not the public URL.
   For example, when uploading, ensure you save pdf_url: invoices/INV-xxx.pdf and not the public URL.

### Example flow:

1. User calls the endpoint to generate the invoice (/invoice/abc-123/generate)
2. Server checks if user.id === order.user_id or user.role === 'admin'
3. If yes, a signed URL is generated for the PDF file
4. The user can open the PDF in the browser or download it
5. The signed URL is valid for a limited time (e.g., 5 minutes)

maybe use auth guard and DTO for that.
