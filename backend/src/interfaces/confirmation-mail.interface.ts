export interface BookingConfirmationEmailProps {
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
