import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ShoppingBag,
  Plug,
  Package,
  Briefcase,
  Shirt,
  Car,
  Utensils,
  MonitorPlay,
  Building2,
  TicketPercent,
  Plane,
  Ellipsis,
} from "lucide-react";

const ADMIN_CATEGORIES = [
  {
    id: 1,
    key: "textile",
    label: "Textile",
    icon: Shirt,
    companyType: "Textile",
    routeType: "physical",
  },
  {
    id: 2,
    key: "electronics",
    label: "Electronics",
    icon: Plug,
    companyType: "Electronics",
    routeType: "physical",
  },
  {
    id: 3,
    key: "fmcg",
    label: "FMCG",
    icon: ShoppingBag,
    companyType: "FMCG",
    routeType: "physical",
  },
  {
    id: 4,
    key: "officesupply",
    label: "Office Supply",
    icon: Briefcase,
    companyType: "Office Supply",
    routeType: "physical",
  },
  {
    id: 5,
    key: "lifestyle",
    label: "Lifestyle",
    icon: Package,
    companyType: "Lifestyle",
    routeType: "physical",
  },
  {
    id: 6,
    key: "mobility",
    label: "Mobility",
    icon: Car,
    companyType: "Mobility",
    routeType: "physical",
  },
  {
    id: 7,
    key: "restaurant",
    label: "Restaurant / QSR",
    icon: Utensils,
    companyType: "QSR",
    routeType: "physical",
  },
  {
    id: 8,
    key: "media",
    label: "Media",
    icon: MonitorPlay,
    companyType: "Media",
    routeType: "media-physical",
  },
  {
    id: 9,
    key: "hotels",
    label: "Hotels",
    icon: Building2,
    companyType: "Hotel",
    routeType: "physical",
  },
  {
    id: 10,
    key: "entertainment",
    label: "Entertainment & Events",
    icon: TicketPercent,
    companyType: "Entertainment & Events",
    routeType: "eephysical",
  },
  {
    id: 11,
    key: "airline",
    label: "Airline Tickets",
    icon: Plane,
    companyType: "Airline Tickets",
    routeType: "physical",
  },
  {
    id: 12,
    key: "others",
    label: "Others",
    icon: Ellipsis,
    companyType: "Others",
    routeType: "physical",
  },
];

function buildTargetPath(category) {
  const params = new URLSearchParams({
    source: "admin",
    companyType: category.companyType,
  });

  if (category.routeType === "media-physical") {
    return `/media-physical?${params.toString()}`;
  }
  if (category.routeType === "eephysical") {
    return `/eephysical?${params.toString()}`;
  }
  return `/physical?${params.toString()}`;
}

export default function AllCategoriesAdmin() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    const target = buildTargetPath(category);
    navigate(target);
  };

  const handleBackToAdmin = () => {
    try {
      if (window.history && window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch {
      // ignore history access issues
    }
    navigate("/sellerhub");
  };

  return (
    <div
      className="admin-categories-bg"
      data-testid="all-categories-admin-page"
    >
      <div className="admin-categories-overlay">

        <main className="admin-categories-main">
          <div className="admin-categories-card">
            <h1 className="admin-categories-title">Choose Any Category</h1>
            <p className="admin-categories-subtitle">
              You can add a product or media in any of the categories below
            </p>

            <div className="admin-category-grid">
              {ADMIN_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className="admin-category-tile"
                    onClick={() => handleCategoryClick(cat)}
                    data-testid={`admin-category-${cat.key}`}
                  >
                    <div className="admin-category-icon-wrap">
                      <Icon className="admin-category-icon" />
                    </div>
                    <span className="admin-category-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

