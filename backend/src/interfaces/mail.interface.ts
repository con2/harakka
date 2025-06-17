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
