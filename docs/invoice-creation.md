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
@UseGuards(AuthGuard) // Sicherstellen, dass Nutzer eingeloggt ist
async getInvoicePdfUrl(
  @Param("orderId") orderId: string,
  @Req() req: RequestWithUser,
): Promise<string> {
  return this.invoiceService.getSignedInvoiceUrl(orderId, req.user);
}
```

#### suppaa. dann hier weiter machen:

ich hab einen private bucket erstellt.
ich möchte gerne nur bestimmten personen zugriff auf die pdf rechnung geben, damit nicht jeder user andere rechnungen sehen kann.
admins sollen zugang zu allen pdfs haben
was muss ich dafür tun?

Sehr gut, dass du einen privaten Bucket erstellt hast – das ist genau der richtige Schritt, um Zugriff gezielt zu steuern. Damit du Rechnungs-PDFs nur autorisierten Nutzern zugänglich machst (z. B. Admins oder dem Nutzer, der die Rechnung erstellt hat), solltest du signierte URLs verwenden, kombiniert mit deiner eigenen Rollen-/Berechtigungslogik in der App.
✅ Ziel

    🔒 PDFs im privaten Bucket → nicht öffentlich zugänglich

    👤 Nur Nutzer, die zur Rechnung gehören (z. B. order.user_id === req.user.id) oder Admins (role === 'admin'), dürfen sie anfordern

    🔑 Du gibst ihnen dann eine zeitlich begrenzte signierte URL zurück

🔧 Umsetzung in Supabase + NestJS

1. 📁 PDF nur per Backend-Route verfügbar machen

Erlaube niemals direkten Zugriff auf die Supabase-Storage-URL im Frontend. Stattdessen:
Schreib eine Route wie:

```ts
@Get("invoice/:orderId/pdf")
@UseGuards(AuthGuard) // Sicherstellen, dass Nutzer eingeloggt ist
async getInvoicePdfUrl(
  @Param("orderId") orderId: string,
  @Req() req: RequestWithUser,
): Promise<string> {
  return this.invoiceService.getSignedInvoiceUrl(orderId, req.user);
}
```

2. 🧠 In invoice.service.ts:

```ts
async getSignedInvoiceUrl(orderId: string, user: { id: string; role: string }): Promise<string> {
  const supabase = this.supabaseService.getServiceClient();

  // Prüfen, ob der Nutzer zur Rechnung gehört
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .single();

  if (!order || error) {
    throw new BadRequestException("Order not found");
  }

  // Nur Eigentümer oder Admin darf die PDF sehen
  const isOwner = order.user_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new BadRequestException("You are not authorized to access this invoice");
  }

  const filePath = `invoices/INV-${orderId}.pdf`;

  const { data, error: urlError } = await supabase.storage
    .from("invoices")
    .createSignedUrl(filePath, 60 * 5); // Gültig für 5 Minuten

  if (!data?.signedUrl || urlError) {
    throw new BadRequestException("Failed to generate signed URL");
  }

  return data.signedUrl;
}
```

3. 🔐 Authentifizierung sicherstellen

   Nutze @UseGuards(AuthGuard) (JWT, session, Supabase client, etc.)

   Stelle sicher, dass req.user.id und req.user.role verfügbar sind

4. 📁 Datei korrekt speichern

Stelle sicher, dass du bei Upload pdf_url: invoices/INV-xxx.pdf speicherst, und nicht die public URL.
🧪 Beispiel-Ablauf

    👤 User ruft /invoice/abc-123/pdf

    🔒 Server prüft, ob user.id === order.user_id oder user.role === 'admin'

    ✅ Wenn ja, wird ein temporärer Link (z. B. 5 Minuten gültig) zurückgegeben

    🧾 Der User kann die PDF im Browser oder per Download öffnen

Möchtest du, dass ich dir ein vollständiges Beispiel mit AuthGuard und DTO schreibe?
