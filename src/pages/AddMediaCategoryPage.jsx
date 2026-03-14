import React from "react";
import { useNavigate } from "react-router-dom";


import Cinema from "../assets/AddMediaCategoryPageIcons/Cinema.svg"
import Airport from "../assets/AddMediaCategoryPageIcons/Airport.svg"
import DOOH from "../assets/AddMediaCategoryPageIcons/Dooh.svg"
import Outdoor from "../assets/AddMediaCategoryPageIcons/Outdoor.svg"
import OfflineBTL from "../assets/AddMediaCategoryPageIcons/Offline-BTL.svg"
import Print from "../assets/AddMediaCategoryPageIcons/Print.svg"
import Radio from "../assets/AddMediaCategoryPageIcons/Radio.svg"
import Television from "../assets/AddMediaCategoryPageIcons/Television.svg"
import Other from "../assets/AddMediaCategoryPageIcons/Other.svg"

const MEDIA_CATEGORIES = [
  {
    id: 1,
    key: "cinema",
    label: "Cinema",
    icon: Cinema,
    companyType: "Cinema",
    routeType: "media-physical",
  },
  {
    id: 2,
    key: "airport",
    label: "Airport",
    icon: Airport,
    companyType: "Airport",
    routeType: "media-physical",
  },
  {
    id: 3,
    key: "dooh",
    label: "DOOH",
    icon: DOOH,
    companyType: "DOOH",
    routeType: "media-physical",
  },
  {
    id: 4,
    key: "outdoor",
    label: "Outdoor",
    icon: Outdoor,
    companyType: "Outdoor",
    routeType: "media-physical",
  },
  {
    id: 5,
    key: "offlinebtl",
    label: "Offline-BTL",
    icon: OfflineBTL,
    companyType: "OfflineBTL",
    routeType: "media-physical",
  },
  {
    id: 6,
    key: "print",
    label: "Print",
    icon: Print,
    companyType: "Print",
    routeType: "media-physical",
  },
  {
    id: 7,
    key: "radio",
    label: "Radio",
    icon: Radio,
    companyType: "Radio",
    routeType: "media-physical",
  },
  {
    id: 8,
    key: "television",
    label: "Television",
    icon: Television,
    companyType: "Television",
    routeType: "media-physical",
  },
  {
    id: 9,
    key: "other",
    label: "Other",
    icon: Other,
    companyType: "Other",
    routeType: "media-physical",
  },
];

function buildTargetPath(category) {
  const params = new URLSearchParams({
    source: "admin",
    companyType: category.companyType,
  });

  if (category.routeType === "media-physical") {
    return `/media-media-physical?${params.toString()}`;
  }
  if (category.routeType === "eephysical") {
    return `/eephysical?${params.toString()}`;
  }
  return `/media-physical?${params.toString()}`;
}

export default function AllMediaCategories() {
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
    className="media-categories-bg"
    data-testid="all-categories-admin-page"
    >
    <div className="media-categories-overlay">

        <main className="media-categories-main">
        <div className="media-categories-card">
            <h1 className="media-categories-title">Choose Any Media Category</h1>
            <p className="media-categories-subtitle">
            You can add a media in any of the categories below
            </p>

            <div className="media-category-grid">
            {MEDIA_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                <button
                    key={cat.id}
                    type="button"
                    className="media-category-tile"
                    onClick={() => handleCategoryClick(cat)}
                    data-testid={`admin-category-${cat.key}`}
                >
                    <img src={Icon} className="media-category-icon" />
                    <span className="media-category-label">{cat.label}</span>
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

