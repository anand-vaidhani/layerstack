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

type InviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  /**
   * Remount key — bump after a successful invite so the form (and role
   * select) reset, while cancelling keeps whatever was typed.
   */
  formKey: number;
  onSubmit: (formData: FormData) => void;
};

export function InviteDialog({ open, onOpenChange, pending, formKey, onSubmit }: InviteDialogProps) {
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>
            Send an invitation to join this workspace. Seats count against your plan limit.
            No email is sent in this app — copy the invite link from the table and share it.
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
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="teammate@company.com"
              autoFocus
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                if (v) setRole(v as "ADMIN" | "MEMBER");
              }}
              items={[
                { label: "MEMBER", value: "MEMBER" },
                { label: "ADMIN", value: "ADMIN" },
              ]}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">MEMBER — can view and create projects</SelectItem>
                <SelectItem value="ADMIN">ADMIN — can manage team and projects</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="role" value={role} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
