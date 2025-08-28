// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { Pencil } from "lucide-react";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { ordersApi } from "@/api/services/orders";
// import { format } from "date-fns";
// import { useAppDispatch } from "@/store/hooks";
// import { updateOrder } from "@/store/slices/ordersSlice";

// export default function OrderEditButton({
//   id,
//   closeModal,
// }: {
//   id: string;
//   closeModal?: () => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const [startPickerOpen, setStartPickerOpen] = useState(false);
//   const [endPickerOpen, setEndPickerOpen] = useState(false);
//   const today = new Date();
//   const dispatch = useAppDispatch();

//   const [editingItems, setEditingItems] = useState<Record<number, number>>(
//     Object.fromEntries(order.order_items.map(i => [i.id, i.quantity]))
//   );
//   const [globalStartDate, setGlobalStartDate] = useState(
//     id.order_items.reduce((earliest, i) =>
//       new Date(i.start_date) < new Date(earliest) ? i.start_date : earliest,
//       order.order_items[0].start_date
//     )
//   );
//   const [globalEndDate, setGlobalEndDate] = useState(
//     order.order_items.reduce((latest, i) =>
//       new Date(i.end_date) > new Date(latest) ? i.end_date : latest,
//       order.order_items[0].end_date
//     )
//   );
//   const [availability, setAvailability] = useState<Record<number, number>>({});
//   const [loadingAvailability, setLoadingAvailability] = useState<Record<number, boolean>>({});

//   useEffect(() => {
//     const fetchAvailability = async () => {
//       for (const item of order.order_items) {
//         const itemId = item.item_id;
//         const orderQty = item.quantity;

//         setLoadingAvailability(prev => ({ ...prev, [itemId]: true }));

//         try {
//           const res = await itemsApi.checkAvailability(itemId, globalStartDate, globalEndDate);
//           setAvailability(prev => ({
//             ...prev,
//             [itemId]: res.availableQuantity + orderQty,
//           }));
//         } catch (e) {
//           toast.error("Failed to fetch availability.");
//         } finally {
//           setLoadingAvailability(prev => ({ ...prev, [itemId]: false }));
//         }
//       }
//     };

//     fetchAvailability();
//   }, [globalStartDate, globalEndDate]);

//   const isFormValid = order.order_items.every(item => {
//     if (typeof item.id !== "number") return false;
//     const qty = editingItems[item.id];
//     const max = availability[Number(item.item_id)];
//     return qty <= max;
//   });

//   const handleSave = async () => {
//     const items = order.order_items.map(item => ({
//       order_item_id: item.id,
//       item_id: item.item_id,
//       quantity: typeof item.id === "number" ? editingItems[item.id] : item.quantity,
//       start_date: globalStartDate,
//       end_date: globalEndDate,
//     }));

//     try {
//       await dispatch(updateOrder({ orderId: order.id, items }));
//       toast.success("Order updated");
//       setOpen(false);
//       closeModal?.();
//     } catch {
//       toast.error("Update failed");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Pencil className="h-4 w-4" />
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-sm overflow-visible">
//         <div className="text-lg font-semibold">
//           Edit Order #{order.order_number}
//         </div>

//         {/* Date Pickers */}
//         <div className="flex gap-4 mt-4">
//           <div>
//             <label className="text-sm block mb-1">Start Date</label>
//             <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full">
//                   {globalStartDate ? format(new Date(globalStartDate), "d MMM yyyy") : "Pick date"}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="single"
//                   selected={new Date(globalStartDate)}
//                   onSelect={date => setGlobalStartDate(date?.toISOString() ?? globalStartDate)}
//                   disabled={date => date < today}
//                 />
//               </PopoverContent>
//             </Popover>
//           </div>

//           <div>
//             <label className="text-sm block mb-1">End Date</label>
//             <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full">
//                   {globalEndDate ? format(new Date(globalEndDate), "d MMM yyyy") : "Pick date"}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="single"
//                   selected={new Date(globalEndDate)}
//                   onSelect={date => setGlobalEndDate(date?.toISOString() ?? globalEndDate)}
//                   disabled={date =>
//                     date < today || new Date(globalStartDate) > date
//                   }
//                 />
//               </PopoverContent>
//             </Popover>
//           </div>
//         </div>

//         {/* Items */}
//         <div className="space-y-3 mt-6">
//           {order.order_items.map(item => {
//             const currentQty = typeof item.id === "number" ? (editingItems[item.id] ?? item.quantity) : item.quantity;
//             const maxQty = availability[Number(item.item_id)];

//             return (
//               <div key={item.id} className="grid grid-cols-5 gap-4 items-end">
//                 <div className="col-span-2">
//                   <label className="text-xs block mb-1">Item</label>
//                   <p className="text-sm">
//                     {
//                       item.storage_items?.translations?.en?.item_name ??
//                       item.item_name ??
//                       "Unnamed"
//                     }
//                   </p>
//                 </div>

//                 <div className="col-span-3 flex items-center gap-1">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() =>
//                       setEditingItems(prev => ({
//                         ...prev,
//                         [Number(item.id)]: Math.max(0, currentQty - 1),
//                       }))
//                     }
//                     disabled={currentQty <= 0}
//                   >
//                     –
//                   </Button>
//                   <Input
//                     type="number"
//                     className="w-[50px] text-center"
//                     value={currentQty}
//                     onChange={e => {
//                       const value = Number(e.target.value);
//                       if (!isNaN(value) && value >= 0) {
//                         setEditingItems(prev => ({ ...prev, [Number(item.id)]: value }));
//                       }
//                     }}
//                   />
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() =>
//                       setEditingItems(prev => ({
//                         ...prev,
//                         [Number(item.id)]: currentQty + 1,
//                       }))
//                     }
//                     disabled={
//                       maxQty !== undefined && currentQty >= maxQty
//                     }
//                   >
//                     +
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Footer Buttons */}
//         <div className="flex justify-between gap-2 mt-6">
//           <Button variant="secondary" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button variant="outline" disabled={!isFormValid} onClick={handleSave}>
//             Save Changes
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
