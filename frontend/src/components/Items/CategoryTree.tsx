import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type CategoryNode = {
  id: string;
  parent_id: string | null;
  translations: {
    fi: string;
    en: string;
  };
  subcategories?: CategoryNode[];
};

export function CategoryTree({
  nodes,
  lang,
  selectedIds,
  onToggleSelect,
  expandedIds,
  onToggleExpand,
  depth = 0,
}: {
  nodes: CategoryNode[];
  lang: "fi" | "en";
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  depth?: number;
}) {
  const paddingLeft = depth * 12; // px

  const hasAnyDescendantSelected = (node: CategoryNode): boolean => {
    if (!node.subcategories || node.subcategories.length === 0) return false;
    for (const child of node.subcategories) {
      if (selectedIds.has(child.id) || hasAnyDescendantSelected(child))
        return true;
    }
    return false;
  };

  const branchClass = depth === 0 ? "pl-0" : "pl-3 border-l border-slate-200";

  return (
    <div className={`space-y-1 ${branchClass}`}>
      {nodes.map((node) => {
        const hasChildren = (node.subcategories?.length ?? 0) > 0;
        const isSelected = selectedIds.has(node.id);
        const hasChildSelected = hasAnyDescendantSelected(node);
        const isOpen = expandedIds.has(node.id);
        const labelClass = isSelected
          ? "text-secondary font-semibold"
          : hasChildSelected
            ? "text-secondary"
            : "text-slate-700";

        return (
          <div key={node.id} className="flex flex-col gap-1">
            <div className="flex items-center" style={{ paddingLeft }}>
              {hasChildren ? (
                <button
                  type="button"
                  className="p-0 mr-1 text-slate-600 hover:text-slate-600 focus:outline-none"
                  aria-label={isOpen ? "Collapse" : "Expand"}
                  onClick={() => onToggleExpand(node.id)}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-90" : "transform rotate-0"}`}
                  />
                </button>
              ) : (
                <span className="inline-block w-4 mr-1" />
              )}
              <Button
                className={`justify-start h-fit px-0 no-underline hover:underline hover:bg-transparent hover:text-current focus-visible:ring-0 focus:outline-none  underline-offset-4 ${labelClass}`}
                variant="ghost"
                onClick={() => onToggleSelect(node.id)}
                title={
                  node.translations[lang] ||
                  node.translations[lang === "fi" ? "en" : "fi"]
                }
              >
                <span className="max-w-[180px] truncate inline-block align-top text-left">
                  {node.translations[lang] ||
                    node.translations[lang === "fi" ? "en" : "fi"]}
                </span>
              </Button>
            </div>

            {hasChildren && isOpen && (
              <CategoryTree
                nodes={node.subcategories!}
                lang={lang}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CategoryTree;
