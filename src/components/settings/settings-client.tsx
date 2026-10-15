import { OrgSettingsCard } from "./org-settings-card";
import { PasswordSettingsCard } from "./password-settings-card";
import { ProfileSettingsCard } from "./profile-settings-card";

type SettingsClientProps = {
  orgName: string;
  userName: string;
  userEmail: string;
  canEditOrg: boolean;
};

/** Layout only — each settings card owns its own form, submit and state. */
export function SettingsClient({ orgName, userName, userEmail, canEditOrg }: SettingsClientProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <OrgSettingsCard orgName={orgName} canEditOrg={canEditOrg} />
      <ProfileSettingsCard userName={userName} userEmail={userEmail} />
      <PasswordSettingsCard className="shadow-xs lg:col-span-2" />
    </div>
  );
}
