import { useState, useEffect, useCallback } from 'react';
import { authApi, companyApi } from '../utils/api';

/**
 * Returns logged-in user, company type name, and admin flag.
 * - user: IamUser from auth/logged_user (companyId, superAdmin, roleName, etc.)
 * - companyType: CompanyTypeName string (e.g. 'Media', 'Others', 'Textile')
 * - companyTypeId: id used for get_companyType
 * - isAdmin: true if user.superAdmin or roleName === 'ADMIN'
 * - loading, error, refetch
 */
export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [companyTypeName, setCompanyTypeName] = useState('');
  const [companyTypeId, setCompanyTypeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authApi.getLoggedInUser();
      const userData = userRes?.data;
      if (!userData || userData === false) {
        setUser(null);
        setCompany(null);
        setCompanyTypeName('');
        setCompanyTypeId(null);
        return;
      }
      setUser(userData);

      try {
        const companyRes = await authApi.getAuthCompany();
        const companyData = companyRes?.data;
        if (companyData && companyData.companyType) {
          setCompany(companyData);
          setCompanyTypeId(companyData.companyType);
          const typeRes = await companyApi.getCompanyType(companyData.companyType);
          const name = typeRes?.data?.CompanyTypeName || typeRes?.data?.stringValue || '';
          setCompanyTypeName(name);
        } else {
          setCompany(companyData || null);
          setCompanyTypeName('');
        }
      } catch (e) {
        setCompany(null);
        setCompanyTypeName('');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Auth check failed');
      setUser(null);
      setCompany(null);
      setCompanyTypeName('');
      setCompanyTypeId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isAdmin = !!(user?.superAdmin === true || user?.roleName === 'ADMIN');

  return {
    user,
    company,
    companyType: companyTypeName,
    companyTypeId,
    isAdmin,
    loading,
    error,
    refetch,
    isAuthenticated: !!user,
  };
}

export default useAuthUser;
