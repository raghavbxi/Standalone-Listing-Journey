import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthUser } from '../../hooks/useAuthUser';
import useListingEntryContext from '../../hooks/useListingEntryContext';
import { getAllowedCategories, getAllowedVouchers } from '../../config/categories';

export default function ListingAccessGuard({ kind, category, children }) {
  const { companyType, isAdmin, loading } = useAuthUser();
  const { source, entryCompanyType } = useListingEntryContext();

  const allowAdminAllCategories = isAdmin && source !== 'dashboard';
  const effectiveCompanyType = companyType || entryCompanyType || 'Others';

  if (loading) {
    return null;
  }

  let isAllowed = false;
  if (kind === 'voucher') {
    const allowedVouchers = getAllowedVouchers(effectiveCompanyType, allowAdminAllCategories);
    isAllowed = category
      ? allowedVouchers.some((voucher) => voucher.id === category)
      : allowedVouchers.length > 0;
  } else {
    const allowedCategories = getAllowedCategories(effectiveCompanyType, allowAdminAllCategories);
    isAllowed = category
      ? allowedCategories.some((item) => item.slug === category)
      : allowedCategories.length > 0;
  }

  if (!isAllowed) {
    return <Navigate to="/sellerhub" replace />;
  }

  return children;
}
