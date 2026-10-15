import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES } from "./constants";

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  /** Remount key — bump after a successful create to reset title + status. */
  formKey: number;
  onSubmit: (formData: FormData) => void;
};

export function CreateProjectDialog({ open, onOpenChange, pending, formKey, onSubmit }: CreateProjectDialogProps) {
  const [status, setStatus] = useState<string>("Active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Create a project in this organization. Plan limits are enforced on save.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(new FormData(e.currentTarget));
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="project-title">Title</Label>
            <Input id="project-title" name="title" placeholder="e.g. Q4 Marketing Site" autoFocus required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v ?? "Active")}
              items={STATUSES.map((s) => ({ label: s, value: s }))}
            >
              <SelectTrigger id="project-status" name="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
