import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Labeled input row used by the sign-in / sign-up forms. */
export function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  readOnly = false,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={required}
      />
    </div>
  );
}
