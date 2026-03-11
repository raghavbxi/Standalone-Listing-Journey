import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/useAuthUser";
import BXI_logo from "../../assets/BXI Listing LOGO.svg";
import GoBackIcon from "../../assets/navbarBackIcon.svg";

export default function TopNavbar() {
  const navigate = useNavigate();
  const { user, companyAvatar } = useAuthUser();

  return (
    <nav className="w-full bg-[#f3f4f6] border-b border-gray-200 px-6 py-2">
  <div className="w-full flex items-center justify-between">

    {/* Left Section */}
    <div className="flex items-center gap-2">
      <img
        src={BXI_logo}
        alt="BXI Logo"
        className="w-12 h-12 object-contain"
      />
      <span className="text-gray-800 font-medium text-base">
        Barter Exchange of India
      </span>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-6">
      <span className="text-sm text-gray-600 font-medium">
        {user?.name}
      </span>
      {companyAvatar && (
        <div className="flex items-center gap-2">
          <img
            src={companyAvatar}
            alt="Company Logo"
            className="w-12 h-12 object-contain shadow-md rounded-full"
          />
        </div>
      )}

      <button
        onClick={() => navigate("/marketplace")}
        className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2261A2] border-2 border-[#2261A2] rounded-md hover:bg-[#2261A2] hover:text-white transition"
      >
        <img src={GoBackIcon}
        className="transition group-hover:brightness-0 group-hover:invert"
        />
        Back to Marketplace
      </button>
    </div>

  </div>
</nav>
  );
}
