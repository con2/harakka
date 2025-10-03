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
    <div onMouseDown={(e) => e.stopPropagation()} data-cy="toast-confirm-root">
      <Card
        className="toast-confirm-card w-[360px]"
        data-cy="toast-confirm-card"
      >
        <CardHeader>
          <CardTitle
            className="text-lg"
            style={{ zIndex: 9999, pointerEvents: "auto" }}
            data-cy="toast-confirm-title"
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-col gap-2"
          data-cy="toast-confirm-content"
        >
          <p
            className="text-sm text-muted-foreground"
            data-cy="toast-confirm-description"
          >
            {description}
          </p>
          <div
            className="flex justify-between gap-2 mt-2"
            data-cy="toast-confirm-actions"
          >
            <Button
              variant="outline"
              data-cy="toast-cancel-btn"
              onClick={() => {
                toast.dismiss(t);
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              data-cy="toast-confirm-btn"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await onConfirm();
                } catch {
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
