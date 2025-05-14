import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ToastConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
};

export const toastConfirm = ({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ToastConfirmOptions) => {
  toast.custom((t) => (
    <div onMouseDown={(e) => e.stopPropagation()}>
      <Card className="w-[360px] shadow-lg border">
        <CardHeader>
          <CardTitle className="text-lg" style={{ zIndex: 9999, pointerEvents: "auto" }}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                toast.dismiss(t);
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await onConfirm();
                } catch (err) {
                  toast.error("Action failed.");
                }
              }}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ));
};
