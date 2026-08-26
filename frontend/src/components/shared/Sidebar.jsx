import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, Stethoscope, Calendar, FileText, Pill, MessageSquare, 
  Bell, Settings, Hospital, ClipboardList, ShieldCheck, Activity, Home, LogIn, UserPlus, UserCog } from "lucide-react";

const Sidebar = () => {
  const { isAdmin, isDoctor, isPatient, doctorVerified } = useAuth();
  const location = useLocation();

  const guestLinks = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/doctors", icon: Stethoscope, label: "Find Doctors" },
  { to: "/hospitals", icon: Hospital, label: "Hospitals" },
  { to: "/login", icon: LogIn, label: "Login" },
  { to: "/register", icon: UserPlus, label: "Register" },
];

  const patientLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/doctors", icon: Stethoscope, label: "Find Doctors" },
    { to: "/hospitals", icon: Hospital, label: "Hospitals" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/healthlogs", icon: Activity, label: "Health Logs" },
    { to: "/reminders", icon: Pill, label: "Reminders" },
    { to: "/prescriptions", icon: FileText, label: "Prescriptions" },
    { to: "/ai", icon: MessageSquare, label: "AI Assistant" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const doctorLinksUnverified = [
        { to: "/doctor/upload-docs", icon: FileText, label: "Verification Docs" },
        { to: "/notifications", icon: Bell, label: "Notifications" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

  const doctorLinksVerified = [
        { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
        { to: "/doctor/patients", icon: Users, label: "Patients" },
        { to: "/doctor/profile", icon: UserCog, label: "My Profile" },
        { to: "/hospitals", icon: Hospital, label: "Hospitals" },
        { to: "/notifications", icon: Bell, label: "Notifications" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
    { to: "/admin/doctors/pending", icon: ShieldCheck, label: "Pending Doctors" },
    { to: "/admin/hospitals", icon: Hospital, label: "Hospitals" },
    { to: "/admin/notify", icon: Bell, label: "Send Notification" },
    { to: "/admin/logs", icon: ClipboardList, label: "Audit Logs" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const doctorLinks = doctorVerified ? doctorLinksVerified : doctorLinksUnverified;

  const links = isAdmin ? adminLinks : isDoctor ? doctorLinks : isPatient ? patientLinks : guestLinks;

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${
                                  isActive
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
                                }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-gray-400"}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
