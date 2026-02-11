import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SOURCE_KEY = 'listing_entry_source';
const COMPANY_TYPE_KEY = 'listing_entry_company_type';

export default function useListingEntryContext() {
  const location = useLocation();
  const normalizeParamValue = (value) => {
    if (value === undefined || value === null) return '';
    const normalized = String(value).trim();
    if (!normalized) return '';
    if (normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
      return '';
    }
    return normalized;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const source = normalizeParamValue(params.get('source'));
    const companyType = normalizeParamValue(params.get('companyType'));

    if (source) {
      sessionStorage.setItem(SOURCE_KEY, source);
    }
    if (companyType) {
      sessionStorage.setItem(COMPANY_TYPE_KEY, companyType);
    }
  }, [location.search]);

  const sourceFromQuery = normalizeParamValue(new URLSearchParams(location.search).get('source'));
  const sourceFromStorage = normalizeParamValue(sessionStorage.getItem(SOURCE_KEY));
  const source = sourceFromQuery || sourceFromStorage || '';

  const companyTypeFromQuery = normalizeParamValue(new URLSearchParams(location.search).get('companyType'));
  const companyTypeFromStorage = normalizeParamValue(sessionStorage.getItem(COMPANY_TYPE_KEY));
  const entryCompanyType = companyTypeFromQuery || companyTypeFromStorage || '';

  return { source, entryCompanyType };
}
