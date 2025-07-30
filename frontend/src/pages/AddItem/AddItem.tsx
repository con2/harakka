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
import { useEffect, useState } from "react";
import { t } from "@/translations";
import { Button } from "@/components/ui/button";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { getItemColumns } from "./add-item.columns";
import { DataTable } from "@/components/ui/data-table";
import {
  fetchLocationsByOrgId,
  selectCurrentOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { MapPin } from "lucide-react";
import { SelectedOrg, SelectedStorage } from "./add-item.types";
import { createItem } from "@/store/slices/itemsSlice";
import AddItemForm from "@/components/Admin/Items/AddItemForm";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";

function AddItem() {
  const userOrganizations = useAppSelector(selectCurrentUserOrganizations);
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg>({
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
  const [storage, setStorage] = useState<SelectedStorage>(undefined);
  const orgLocations = useAppSelector(selectCurrentOrgLocations);
  const tags = useAppSelector(selectAllTags);

  /*---------------------handlers-----------------------------*/
  const handleOrgChange = (org_id: string) => {
    const newOrg = userOrganizations.find(
      (org) => org.organization_id === org_id,
    );
    if (!newOrg) return;
    setStorage(undefined);
    void dispatch(fetchLocationsByOrgId(newOrg?.organization_id));
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
  const handleSubmit = () => dispatch(createItem(newItems));

  useEffect(() => console.log(newItems), [newItems]);
  useEffect(() => {
    if (tags.length < 1) void dispatch(fetchAllTags({ page: 1, limit: 20 }));
  }, [tags, dispatch]);
  useEffect(() => {
    if (orgLocations && orgLocations.length === 1)
      setStorage({
        name: orgLocations[0].storage_locations.name ?? "",
        id: orgLocations[0].storage_location_id,
        address: orgLocations[0].storage_locations.address ?? "",
      });
  }, [orgLocations]);

  /*---------------------render--------------------------------*/
  if (orgsLoading) return <Spinner height="h-4/6" />;

  return (
    <>
      {/* Organization Selection */}
      <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] flex-col p-10 gap-4">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
          Organization & Location
        </p>
        <div>
          <Select
            value={selectedOrg.organization_name}
            onValueChange={handleOrgChange}
            required
            name="organization"
          >
            <SelectTrigger
              disabled={userOrganizations.length === 1}
              className="min-w-[250px] border shadow-none border-grey w-[300px]"
            >
              <SelectValue placeholder={t.addItem.placeholders.selectOrg[lang]}>
                {selectedOrg.organization_name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userOrganizations.map((org) => (
                <SelectItem
                  key={org.organization_id}
                  value={org.organization_id}
                >
                  {org.organization_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Selection */}
        <div className="flex justify-between items-center">
          {orgLocations && (
            <div className="flex gap-2">
              {orgLocations.map((loc) => (
                <Button
                  key={loc.storage_location_id}
                  variant={
                    storage?.id === loc.storage_location_id
                      ? "outline"
                      : "default"
                  }
                  className="gap-2"
                  disabled={orgLocations.length === 1}
                  onClick={() =>
                    setStorage({
                      name: loc.storage_locations?.name ?? "",
                      id: loc.storage_location_id,
                      address: loc.storage_locations?.address ?? "",
                    })
                  }
                >
                  <MapPin />
                  {loc.storage_locations?.name || `Location #${loc.id}`}
                </Button>
              ))}
              {orgLocations.length > 1 && (
                <Button
                  variant={storage === null ? "outline" : "default"}
                  onClick={() => setStorage(null)}
                >
                  {t.addItem.buttons.chooseLocation[lang]}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AddItemForm storage={storage} tags={tags} handleAdd={handleAdd} />

      {newItems.length > 0 && (
        <Button
          className="addBtn"
          size={"sm"}
          disabled={selectedOrg.organization_name === ""}
          onClick={handleSubmit}
        >
          {t.addItem.buttons.addItems[lang]}
        </Button>
      )}
    </>
  );
}

export default AddItem;
