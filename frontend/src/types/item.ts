// export interface ItemDetails {
//     name: string;
//     description: string;
//     features?: string[];
// }

// export interface ItemMedia {
//     images: string[];  // Array of image URLs
//     thumbnail?: string;
//     video?: string;
// }

// export interface Location {
//     lat: number;
//     lng: number;
//     address: {
//         street: string;
//         city: string;
//         state?: string;
//         postalCode: string;
//         country: string;
//     };
// }

// export interface Pricing {
//     rate: number;
//     currency: string;
//     unit?: 'hour' | 'day' | 'week' | 'month';
//     minimumPeriod?: number;
// }

// export interface StorageDimensions {
//     length: number;
//     width: number;
//     height: number;
//     unit?: 'meter' | 'foot';
// }

// export interface Availability {
//     status: 'available' | 'booked' | 'maintenance';
//     bookedDates?: Date[];
// }

export interface Item {
    id: string;
    location: string;
    price: number;
    average_rating: number;
}

export interface ItemState {
    items: Item[];
    loading: boolean;
    error: string | null;
    selectedItem: Item | null;
}
