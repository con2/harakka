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
import { selectItemCreation } from "@/store/slices/itemsSlice";
import { setPrevStep } from "@/store/slices/uiSlice";

function Summary() {
  const { items } = useAppSelector(selectItemCreation);
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  

  const createNext = () => {
    
  }

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
                    <OriginalTableCell className="font-medium">
                      {item.translations[lang].item_name}
                    </OriginalTableCell>
                    <OriginalTableCell>
                      {item.items_number_total}
                    </OriginalTableCell>
                    <OriginalTableCell>
                      {item.location_details.name}
                    </OriginalTableCell>
                    <OriginalTableCell className="text-right">
                      Actions here
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
              <Button variant="default" onClick={createNext}>Create another item</Button>
              <Button variant="outline">Add items to organization</Button>
            </div>
          </>
        ) : (
          <div className="text-center my-6">
            <p className="font-semibold mb-2">No items added yet</p>
            <Button variant="outline" onClick={() => dispatch(setPrevStep())}>
              Go to item creation
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default Summary;
