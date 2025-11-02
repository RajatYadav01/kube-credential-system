import { Link, useLocation } from "react-router";

export default function TabBar() {
  const location = useLocation();

  const tabs = [
    { label: "Issue Credential", to: "/" },
    { label: "Verify Credential", to: "/verify" },
  ];

  return (
    <nav className="flex flex-row border-b border-gray-200 bg-white">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`py-2 px-4 -mb-px border-b-2 w-[50%] font-medium text-sm text-center transition-all
              ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "bg-gray-200 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
