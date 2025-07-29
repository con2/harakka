import Spinner from "@/components/Spinner";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectOrganizationLoading } from "@/store/slices/organizationSlice";
import { selectCurrentUserOrganizations } from "@/store/slices/rolesSlice";
import { Item, ItemFormData } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { t } from "@/translations";
import AddItemModal from "@/components/Admin/Items/AddItemModal";
import { Button } from "@/components/ui/button";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { getItemColumns } from "./add-item.columns";
import { DataTable } from "@/components/ui/data-table";
import { UserOrganization } from "@/types/roles";
import { openItemModal, selectItemModalState } from "@/store/slices/uiSlice";
import UpdateItemModal from "@/components/Admin/Items/UpdateItemModal";

function AddItem() {
  const userOrganizations = useAppSelector(selectCurrentUserOrganizations);
  const [selectedOrg, setSelectedOrg] = useState<
    Omit<UserOrganization, "roles">
  >({
    organization_id: "",
    organization_name: "",
  });
  const orgsLoading = useAppSelector(selectOrganizationLoading);
  const [newItems, setNewItems] = useState<ItemFormData[]>([]);
  const { lang } = useLanguage();
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [editItem, setEditItem] = useState<ItemFormData | null>(null);
  const dispatch = useAppDispatch();
  const modalState = useAppSelector(selectItemModalState);

  /*---------------------handlers-----------------------------*/
  const handleOrgChange = (org_id: string) => {
    const newOrg = userOrganizations.find(
      (org) => org.organization_id === org_id,
    );
    if (!newOrg) return;
    setSelectedOrg(newOrg);
  };
  const handleAdd = (item: ItemFormData) => setNewItems([...newItems, item]);
  const handleEdit = (item: ItemFormData) => setEditItem(item);
  const handleDelete = (item: ItemFormData) =>
    setNewItems(newItems.filter((i) => i.id !== item.id));
  const handleUpdate = (item: Item) => {
    const updatedItems = newItems.map((i) => {
      if (i.id === item.id) {
        Object.assign(i, item);
      }
      return i;
    });
    setNewItems(updatedItems);
  };

  /*---------------------render--------------------------------*/
  if (orgsLoading) return <Spinner height="h-4/6" />;

  return (
    <>
      {/* Organization Selection */}
      <div className="flex gap-3 items-center mb-6">
        <Select
          value={selectedOrg.organization_name}
          onValueChange={handleOrgChange}
          required
          name="organization"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select organization">
              {selectedOrg.organization_name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {userOrganizations.map((org) => (
              <SelectItem key={org.organization_id} value={org.organization_id}>
                {org.organization_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add New Item Button */}
        <Button
          className="addBtn"
          size={"sm"}
          onClick={() => dispatch(openItemModal())}
        >
          {t.adminItemsTable.buttons.addNew[lang]}
        </Button>
      </div>

      {/* List of New Items */}
      {newItems.length > 0 && newItems.length <= 10 && (
        <DataTable
          data={newItems}
          columns={getItemColumns(handleEdit, handleDelete)}
        />
      )}
      {newItems.length > 10 && (
        <PaginatedDataTable
          data={newItems}
          columns={getItemColumns(handleEdit, handleDelete)}
          pageCount={Math.ceil(newItems.length / ITEMS_PER_PAGE)}
          pageIndex={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      )}
      {newItems.length > 0 && (
        <Button
          className="addBtn mt-4"
          size={"sm"}
          disabled={selectedOrg.organization_name === ""}
          onClick={() => {}}
        >
          Add Items to Organization
        </Button>
      )}

      {/* Add Item Modal */}
      {modalState.isOpen && <AddItemModal onAdd={handleAdd} />}

      {/* Update Item Modal */}
      {editItem && (
        <UpdateItemModal
          onUpdate={(item: Item) => handleUpdate(item)}
          onClose={() => setEditItem(null)}
          initialData={editItem as Item}
        />
      )}
    </>
  );
}

export default AddItem;
