import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Package, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/products/ProductCard';
import { TabCard } from '../components/products/TabCard';
import { DeleteDialog } from '../components/products/DeleteDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { toast } from 'sonner';
import {
  fetchLiveProducts,
  fetchDraftProducts,
  fetchAllProducts,
  fetchRejectedProducts,
  fetchDelistProducts,
  fetchPendingProducts,
  deleteProduct,
  deleteDraftProduct,
  relistProduct,
  setActiveTab,
  triggerRefresh,
} from '../redux/slices/productSlice';
import { useAuthUser } from '../hooks/useAuthUser';
import useListingEntryContext from '../hooks/useListingEntryContext';
import { getAllowedCategories, getAllowedVouchers } from '../config/categories';

const TABS = ['Live', 'In Draft', 'Admin Review', 'Delist', 'Rejected', 'All'];

export default function SellerHub() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { source } = useListingEntryContext();
  const {
    companyType: companyTypeName,
    isAdmin,
    loading: authLoading,
    isAuthenticated,
  } = useAuthUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redux state
  const {
    liveProducts,
    draftProducts,
    allProducts,
    rejectedProducts,
    delistProducts,
    pendingProducts,
    activeTab,
    refreshTrigger,
  } = useSelector((state) => state.products);

  const companyType = companyTypeName || 'Others';
  const isMedia = companyType === 'Media';
  const showAdminView = isAdmin && source === 'admin';
  const allowedCategories = getAllowedCategories(companyType, showAdminView);
  const allowedVouchers = getAllowedVouchers(companyType, showAdminView);
  const hasProductAccess = allowedCategories.length > 0;
  const hasVoucherAccess = allowedVouchers.length > 0;
  const addListingPath = hasProductAccess
    ? (isMedia ? '/media-physical' : '/add-product')
    : hasVoucherAccess ? '/generalVoucherForm' : '/sellerhub';
  const addListingLabel = hasProductAccess
    ? (isMedia ? 'Add Media' : 'Add Product')
    : 'Add Voucher';
  const listingTypeLabel = isMedia ? 'media listings' : (hasVoucherAccess && !hasProductAccess ? 'voucher listings' : 'product listings');

  // Fetch all products on mount and refresh
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }
    dispatch(fetchLiveProducts({ page: 1 }));
    dispatch(fetchDraftProducts({ page: 1 }));
    dispatch(fetchAllProducts({ page: 1 }));
    dispatch(fetchRejectedProducts({ page: 1 }));
    dispatch(fetchDelistProducts({ page: 1 }));
    dispatch(fetchPendingProducts({ page: 1 }));
  }, [dispatch, refreshTrigger, authLoading, isAuthenticated]);

  // Fetch current tab data when page changes
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }
    fetchCurrentTabData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab, authLoading, isAuthenticated]);

  const fetchCurrentTabData = (page) => {
    switch (activeTab) {
      case 'Live':
        dispatch(fetchLiveProducts({ page }));
        break;
      case 'In Draft':
        dispatch(fetchDraftProducts({ page }));
        break;
      case 'Admin Review':
        dispatch(fetchPendingProducts({ page }));
        break;
      case 'Delist':
        dispatch(fetchDelistProducts({ page }));
        break;
      case 'Rejected':
        dispatch(fetchRejectedProducts({ page }));
        break;
      case 'All':
        dispatch(fetchAllProducts({ page }));
        break;
      default:
        break;
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'Live':
        return liveProducts;
      case 'In Draft':
        return draftProducts;
      case 'Admin Review':
        return pendingProducts;
      case 'Delist':
        return delistProducts;
      case 'Rejected':
        return rejectedProducts;
      case 'All':
        return allProducts;
      default:
        return liveProducts;
    }
  };

  const currentTabData = getCurrentTabData();
  const { data: products, totalProducts, totalPages, loading } = currentTabData;

  // Tab counts
  const tabCounts = useMemo(() => ({
    'Live': liveProducts.totalProducts || liveProducts.data?.length || 0,
    'In Draft': draftProducts.totalProducts || draftProducts.data?.length || 0,
    'Admin Review': pendingProducts.totalProducts || pendingProducts.data?.length || 0,
    'Delist': delistProducts.totalProducts || delistProducts.data?.length || 0,
    'Rejected': rejectedProducts.totalProducts || rejectedProducts.data?.length || 0,
    'All': allProducts.totalProducts || allProducts.data?.length || 0,
  }), [liveProducts, draftProducts, pendingProducts, delistProducts, rejectedProducts, allProducts]);

  // Handle tab change
  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete?._id) return;

    const isDraft = activeTab === 'In Draft';
    setIsDeleting(true);
    try {
      if (isDraft) {
        await dispatch(deleteDraftProduct(productToDelete._id)).unwrap();
      } else {
        await dispatch(deleteProduct(productToDelete._id)).unwrap();
      }
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      dispatch(triggerRefresh());
      fetchCurrentTabData(currentPage);
    } catch (error) {
      toast.error(error || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRelist = async (product) => {
    if (!product?._id) return;
    try {
      await dispatch(relistProduct({
        productId: product._id,
        ProductUploadStatus: 'Approved',
      })).unwrap();
      toast.success('Product relisted successfully');
      dispatch(triggerRefresh());
      fetchCurrentTabData(currentPage);
    } catch (error) {
      toast.error(error || 'Failed to relist product');
    }
  };

  // Get section title
  const getSectionTitle = () => {
    if (isMedia) {
      switch (activeTab) {
        case 'Live': return 'Live Media';
        case 'In Draft': return 'In Draft Media';
        case 'Admin Review': return 'Admin Review Media';
        case 'Delist': return 'Delisted Media';
        case 'Rejected': return 'Rejected Media';
        case 'All': return 'All Media';
        default: return 'Products';
      }
    }
    switch (activeTab) {
      case 'Live': return 'Live Products';
      case 'In Draft': return 'In Draft Products';
      case 'Admin Review': return 'Admin Review Products';
      case 'Delist': return 'Delisted Products';
      case 'Rejected': return 'Rejected Products';
      case 'All': return 'All Products';
      default: return 'Products';
    }
  };

  // Calculate total products for hero
  const totalProductsCount = tabCounts['All'] || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="seller-hub-page">
      {authLoading ? (
        <div className="loading-container">
          <Loader2 className="w-10 h-10 animate-spin text-[#C64091]" />
        </div>
      ) : null}
      {/* Hero Section */}
      <div className="seller-hero">
        <div className="seller-hero-content">
          {totalProductsCount === 0 ? (
            <>
              <p className="text-white/80 text-lg font-medium mb-1">Start Your</p>
              <h1>Seller Journey</h1>
            </>
          ) : (
            <>
              <h1>{showAdminView ? 'All Listings' : 'Sell with BXI'}</h1>
              <p>Manage your {totalProductsCount} {listingTypeLabel}{showAdminView ? ' (Admin view)' : ''}</p>
            </>
          )}
          <Button
            onClick={() => navigate(addListingPath)}
            className="bg-white text-[#C64091] hover:bg-gray-100 font-semibold px-6 py-3 h-auto shadow-lg hover:shadow-xl transition-shadow"
            data-testid="add-product-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            {addListingLabel}
          </Button>
        </div>
      </div>

      {/* Tab Cards */}
      <div className="tab-cards-container">
        <div className="flex flex-wrap justify-center gap-5">
          {TABS.map((tab) => (
            <TabCard
              key={tab}
              tab={tab}
              count={tabCounts[tab]}
              isActive={activeTab === tab}
              onClick={() => handleTabChange(tab)}
              isMedia={isMedia}
            />
          ))}
        </div>
      </div>

      {/* Section Title */}
      <h2 className="section-title" data-testid="section-title">
        {getSectionTitle()}
      </h2>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-container">
          <Loader2 className="w-10 h-10 animate-spin text-[#C64091]" />
        </div>
      ) : products && products.length > 0 ? (
        <>
          <div className="product-grid" data-testid="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                companyType={companyType}
                tabType={activeTab}
                onDelete={handleDeleteClick}
                onRelist={handleRelist}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      data-testid="pagination-prev"
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                          data-testid={`pagination-${pageNum}`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      data-testid="pagination-next"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state" data-testid="empty-state">
          <Package className="empty-state-icon" />
          <p className="empty-state-text">
            No {isMedia ? 'media' : (hasVoucherAccess && !hasProductAccess ? 'vouchers' : 'products')} in this section yet.
          </p>
          <Button
            onClick={() => navigate(addListingPath)}
            className="mt-4 bg-[#C64091] hover:bg-[#A03375]"
            data-testid="empty-add-product-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First {hasProductAccess ? (isMedia ? 'Media' : 'Product') : 'Voucher'}
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.ProductName}
        isDeleting={isDeleting}
      />
    </div>
  );
}
