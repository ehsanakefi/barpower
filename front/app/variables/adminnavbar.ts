import { Building2, Database, Gauge, Settings, Users } from "lucide-react";
import { Activity } from "react";

export interface Nav {
  to: string;
  label: string;
  icon: any;
  count?: number;
}
export const adminNavItems: Nav[] = [
  { to: "/superadmin/overview", label: "نمای کلی پلتفرم", icon: Gauge },
  { to: "/superadmin/companies", label: "مدیریت شرکت‌ها", icon: Building2 },
  { to: "/superadmin/users", label: "مدیریت کاربران", icon: Users },
  {
    to: "/superadmin/runs",
    label: "اجراها و صف پردازش",
    icon: Activity,
    count: 3,
  },
  { to: "/superadmin/explorer", label: "فیدرها و داده‌ها", icon: Database },
  { to: "/superadmin/settings", label: "تنظیمات و رویدادها", icon: Settings },
];
