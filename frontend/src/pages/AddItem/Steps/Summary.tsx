import { Button } from "@/components/ui/button";
import {
  OriginalTable,
  OriginalTableBody,
  OriginalTableCell,
  OriginalTableFooter,
  OriginalTableHead,
  OriginalTableHeader,
  OriginalTableRow,
} from "@/components/ui/original-table";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearItemCreation,
  createItem,
  editLocalItem,
  removeFromItemCreation,
  selectItemCreation,
  selectItemsError,
  toggleIsEditing,
} from "@/store/slices/itemsSlice";
import { setPrevStep } from "@/store/slices/uiSlice";
import { ItemFormData } from "@common/items/form.types";
import { ClipboardPen, Loader2Icon, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Summary() {
  const form = useAppSelector(selectItemCreation);
  const { items } = form;
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const uploadError = useAppSelector(selectItemsError);
  const navigate = useNavigate();

  const createNext = () => dispatch(setPrevStep());
  const editItem = (id: string) => {
    void dispatch(toggleIsEditing());
    void dispatch(editLocalItem(id));
    dispatch(setPrevStep());
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await dispatch(createItem(form as ItemFormData));
      if (uploadError) throw new Error(uploadError);
      toast.success("Your items were created!");
      dispatch(clearItemCreation());
      void navigate("/admin/items", {
        state: { ascending: false },
      });
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Items could not be created. Contact support if the error persists.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] flex-col p-10 gap-4">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
          New Items Summary
        </p>
        {items.length > 0 ? (
          <>
            <OriginalTable>
              <OriginalTableHeader>
                <OriginalTableRow>
                  <OriginalTableHead>Item</OriginalTableHead>
                  <OriginalTableHead>Quantity</OriginalTableHead>
                  <OriginalTableHead>Storage</OriginalTableHead>
                  <OriginalTableHead className="text-right">
                    Actions
                  </OriginalTableHead>
                </OriginalTableRow>
              </OriginalTableHeader>
              <OriginalTableBody>
                {items.map((item) => (
                  <OriginalTableRow key={item.id}>
                    <OriginalTableCell
                      width="250"
                      className="font-medium max-w-[250px] text-ellipsis overflow-hidden"
                    >
                      {item.translations[lang].item_name}
                    </OriginalTableCell>
                    <OriginalTableCell>
                      {item.items_number_total}
                    </OriginalTableCell>
                    <OriginalTableCell>
                      {item.location_details.name}
                    </OriginalTableCell>
                    <OriginalTableCell className="text-right">
                      <Button
                        onClick={() => editItem(item.id)}
                        variant="outline"
                        className="mr-1 p-2"
                        disabled={loading}
                      >
                        <ClipboardPen />
                      </Button>
                      <Button
                        className="p-2"
                        variant="destructive"
                        onClick={() =>
                          dispatch(removeFromItemCreation(item.id))
                        }
                        disabled={loading}
                      >
                        <Trash />
                      </Button>
                    </OriginalTableCell>
                  </OriginalTableRow>
                ))}
              </OriginalTableBody>
              <OriginalTableFooter>
                <OriginalTableRow>
                  <OriginalTableCell colSpan={4}>
                    Total items {items.length}
                  </OriginalTableCell>
                </OriginalTableRow>
              </OriginalTableFooter>
            </OriginalTable>
            <div className="flex justify-end gap-4">
              <Button variant="default" disabled={loading} onClick={createNext}>
                Create another item
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={handleSubmit}
              >
                Upload items to organization
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center my-6">
            <p className="font-semibold mb-2">No items added yet</p>
            {loading ? (
              <Button variant="outline" disabled>
                <Loader2Icon className="animate-spin" />
                Uploading items...
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => dispatch(setPrevStep())}
              >
                Go to item creation
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Summary;
