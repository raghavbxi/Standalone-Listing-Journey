import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import SellerHub from './pages/SellerHub';
import { GeneralInformation, ProductInfo, TechInfo, GoLive } from './pages/AddProduct/AddProductSteps';
import ProductPreview from './pages/ProductPreview';
import BulkUpload from './pages/BulkUpload';
import VoucherForm from './pages/VoucherForm';
import AddProductCategorySelect from './pages/AddProductCategorySelect';
import { AuthGuard } from './components/AuthGuard';
import ListingAccessGuard from './components/guards/ListingAccessGuard';

// Product Categories
const productCategories = [
  'textile', 'electronics', 'fmcg', 'officesupply', 
  'lifestyle', 'mobility', 'restaurant', 'others',
  'mediaonline', 'mediaoffline'
];

// Voucher Categories
const voucherCategories = [
  'electronicsVoucher', 'fmcgVoucher', 'mobilityVoucher', 'officesupplyVoucher',
  'eeVoucher', 'textileVoucher', 'lifestyleVoucher', 'airlineVoucher',
  'qsrVoucher', 'hotelsVoucher', 'otherVoucher'
];

// Bulk Upload Categories
const bulkUploadCategories = [
  { path: 'textilebulkupload', category: 'textile' },
  { path: 'electronicbulkupload', category: 'electronics' },
  { path: 'fmcgbulkupload', category: 'fmcg' },
  { path: 'officesupplybulkupload', category: 'officesupply' },
  { path: 'mobilitybulkupload', category: 'mobility' },
  { path: 'otherbulkupload', category: 'others' },
  { path: 'resturantbulkupload', category: 'restaurant' },
  { path: 'mediaonlinebulkupload', category: 'mediaonline' },
  { path: 'mediaofflinebulkupload', category: 'mediaoffline' },
];

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <AuthGuard>
          <Routes>
            {/* Root redirect to Seller Hub */}
            <Route path="/" element={<Navigate to="/sellerhub" replace />} />
            
            {/* Seller Hub - Main listing page */}
            <Route path="/sellerhub" element={<SellerHub />} />
            <Route path="/myproduct" element={<Navigate to="/sellerhub" replace />} />

            {/* Add Product – category selection (admin: all 12, non-admin: by company type) */}
            <Route
              path="/add-product"
              element={
                <ListingAccessGuard kind="product">
                  <AddProductCategorySelect />
                </ListingAccessGuard>
              }
            />
            
            {/* Add Product Routes - All Categories */}
            {productCategories.map((category) => (
              <React.Fragment key={category}>
                {/* General Info */}
                <Route 
                  path={`/${category}/general-info`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <GeneralInformation category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/general-info/:id`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <GeneralInformation category={category} />
                    </ListingAccessGuard>
                  } 
                />
                
                {/* Product Info */}
                <Route 
                  path={`/${category}/product-info`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <ProductInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/product-info/:id`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <ProductInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                
                {/* Tech Info */}
                <Route 
                  path={`/${category}/tech-info`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <TechInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/tech-info/:id`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <TechInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                
                {/* Go Live */}
                <Route 
                  path={`/${category}/go-live`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/go-live/:id`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
              </React.Fragment>
            ))}

            {/* Voucher Routes */}
            <Route
              path="/generalVoucherForm"
              element={
                <ListingAccessGuard kind="voucher">
                  <VoucherForm />
                </ListingAccessGuard>
              }
            />
            <Route
              path="/voucher/voucherinfo"
              element={
                <ListingAccessGuard kind="voucher">
                  <VoucherForm />
                </ListingAccessGuard>
              }
            />
            <Route
              path="/voucher/voucherinfo/:id"
              element={
                <ListingAccessGuard kind="voucher">
                  <VoucherForm />
                </ListingAccessGuard>
              }
            />
            
            {voucherCategories.map((category) => (
              <React.Fragment key={category}>
                <Route 
                  path={`/${category}/generalinformation`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GeneralInformation category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/generalinformation/:id`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GeneralInformation category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/techinfo`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <TechInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/techinfo/:id`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <TechInfo category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/golive`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/golive/:id`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/voucherdesign`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}/voucherdesign/:id`} 
                  element={
                    <ListingAccessGuard kind="voucher" category={category}>
                      <GoLive category={category} />
                    </ListingAccessGuard>
                  } 
                />
              </React.Fragment>
            ))}

            {/* Bulk Upload Routes */}
            <Route
              path="/bulkuploadproduct"
              element={
                <ListingAccessGuard kind="product">
                  <BulkUpload />
                </ListingAccessGuard>
              }
            />
            <Route
              path="/productbulkupload"
              element={
                <ListingAccessGuard kind="product">
                  <BulkUpload />
                </ListingAccessGuard>
              }
            />
            {bulkUploadCategories.map(({ path, category }) => (
              <React.Fragment key={path}>
                <Route 
                  path={`/${path}`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <BulkUpload category={category} />
                    </ListingAccessGuard>
                  } 
                />
                <Route 
                  path={`/${category}Bulkuploadshowproducts`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <BulkUpload category={category} />
                    </ListingAccessGuard>
                  } 
                />
              </React.Fragment>
            ))}
            <Route
              path="/bulkuploadexcelpreview"
              element={
                <ListingAccessGuard kind="product">
                  <BulkUpload />
                </ListingAccessGuard>
              }
            />
            <Route
              path="/imageupload"
              element={
                <ListingAccessGuard kind="product">
                  <BulkUpload category="textile" />
                </ListingAccessGuard>
              }
            />

            {/* Preview Routes */}
            <Route path="/allproductpreview/:id" element={<ProductPreview />} />
            <Route path="/allvoucherpreview/:id" element={<ProductPreview />} />
            <Route path="/specificvoucherpreview/:id" element={<ProductPreview />} />
            <Route path="/electronicsproductpreview/:id" element={<ProductPreview />} />
            <Route path="/RestaurantProductPreview/:id" element={<ProductPreview />} />
            <Route path="/fmcgproductpreview/:id" element={<ProductPreview />} />
            <Route path="/mediaonlineproductpreview/:id" element={<ProductPreview />} />
            <Route path="/multiplexmediaonlineproductpreview/:id" element={<ProductPreview />} />
            <Route path="/mediaSheetsProductsPreview/:id" element={<ProductPreview />} />
            <Route path="/mobilityproductpreview/:id" element={<ProductPreview />} />
            <Route path="/textilepreviewpage/:id" element={<ProductPreview />} />
            <Route path="/valueandgiftvoucher/:id" element={<ProductPreview />} />
            <Route path="/spacificvoucher/:id" element={<ProductPreview />} />
            <Route path="/textilesvoucherprev/:id" element={<ProductPreview />} />

            {/* Fallback - redirect to seller hub */}
            <Route path="*" element={<Navigate to="/sellerhub" replace />} />
          </Routes>
          </AuthGuard>
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
