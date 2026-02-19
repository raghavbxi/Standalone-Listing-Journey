import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/useAuthUser";
import BXI_logo from "../../assets/BXI Listing LOGO.svg";

export default function TopNavbar() {
  const navigate = useNavigate();
  const { user } = useAuthUser();

  return (
    <nav className="w-full bg-[#f3f4f6] border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className=" flex items-center justify-center">
            <img
              src={BXI_logo}   
              alt="BXI Logo"
              className="w-12 h-12 object-contain"
            />
          </div>

          <span className="text-gray-800 font-medium text-base">
            Barter Exchange of India
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600 font-medium">
            {user?.name}
          </span>

          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C64091] border border-[#C64091] rounded-full hover:bg-[#C64091] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
        </div>

      </div>
    </nav>
  );
}
