export interface EmailProps {
  name: string;
  email: string;
  pickupDate: string; // pickup date
  today: string; // send date
  location: string;
  items: {
    item_id: string;
    quantity: number;
    translations: {
      fi: { name: string };
      en: { name: string };
    };
  }[];
}

export interface PickUpEmail {
  name: string;
  email: string;
  location: string;
  pickupDate: string;
  items: {
    item_id: string;
    quantity: number;
    translations: {
      fi: { name: string };
      en: { name: string };
    };
  }[];
}

export enum BookingMailType {
  Creation = "creation",
  Confirmation = "confirmation",
  Update = "update",
  Cancellation = "cancellation",
  Rejection = "rejection",
  Deletion = "deletion",
  ItemsReturned = "itemsReturned",
  ItemsPickedUp = "itemsPickedUp",
}

export interface BookingMailParams {
  bookingId: string; // always required
  triggeredBy: string; // userId of actor (admin / owner)
}

/**
 * Simple payload for one‑off welcome / password‑reset mails.
 */
export interface WelcomeEmailPayload {
  name: string;
  email: string;
}
