import {
  Calculator,
  Calendar,
  Clock,
  Database,
  GitBranch,
  LayoutDashboard,
} from "lucide-react";
import { Nav } from "./adminnavbar";

export const userNavItems: Nav[] = [
  { to: "/user/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { to: "/user/loaddata", label: "داده‌های بار شبکه", icon: Database },
  {
    to: "/user/temporalconstraints",
    label: "محدودیت‌های زمانی خاموشی",
    icon: Clock,
  },
  {
    to: "/user/feederrelations",
    label: "محدودیت‌های هم‌زمانی فیدرها",
    icon: GitBranch,
  },
  {
    to: "/user/weeklycalculation",
    label: "محاسبه برنامه هفتگی",
    icon: Calculator,
  },
  { to: "/user/scheduleviewer", label: "مشاهده برنامه خاموشی", icon: Calendar },
];
