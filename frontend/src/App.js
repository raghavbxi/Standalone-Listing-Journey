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
          <Routes>
            {/* Root redirect to Seller Hub */}
            <Route path="/" element={<Navigate to="/sellerhub" replace />} />
            
            {/* Seller Hub - Main listing page */}
            <Route path="/sellerhub" element={<SellerHub />} />
            <Route path="/myproduct" element={<Navigate to="/sellerhub" replace />} />
            
            {/* Add Product Routes - All Categories */}
            {productCategories.map((category) => (
              <React.Fragment key={category}>
                {/* General Info */}
                <Route 
                  path={`/${category}/general-info`} 
                  element={<GeneralInformation category={category} />} 
                />
                <Route 
                  path={`/${category}/general-info/:id`} 
                  element={<GeneralInformation category={category} />} 
                />
                
                {/* Product Info */}
                <Route 
                  path={`/${category}/product-info`} 
                  element={<ProductInfo category={category} />} 
                />
                <Route 
                  path={`/${category}/product-info/:id`} 
                  element={<ProductInfo category={category} />} 
                />
                
                {/* Tech Info */}
                <Route 
                  path={`/${category}/tech-info`} 
                  element={<TechInfo category={category} />} 
                />
                <Route 
                  path={`/${category}/tech-info/:id`} 
                  element={<TechInfo category={category} />} 
                />
                
                {/* Go Live */}
                <Route 
                  path={`/${category}/go-live`} 
                  element={<GoLive category={category} />} 
                />
                <Route 
                  path={`/${category}/go-live/:id`} 
                  element={<GoLive category={category} />} 
                />
              </React.Fragment>
            ))}

            {/* Voucher Routes */}
            <Route path="/generalVoucherForm" element={<VoucherForm />} />
            <Route path="/voucher/voucherinfo" element={<VoucherForm />} />
            <Route path="/voucher/voucherinfo/:id" element={<VoucherForm />} />
            
            {voucherCategories.map((category) => (
              <React.Fragment key={category}>
                <Route 
                  path={`/${category}/generalinformation`} 
                  element={<GeneralInformation category={category} />} 
                />
                <Route 
                  path={`/${category}/generalinformation/:id`} 
                  element={<GeneralInformation category={category} />} 
                />
                <Route 
                  path={`/${category}/techinfo`} 
                  element={<TechInfo category={category} />} 
                />
                <Route 
                  path={`/${category}/techinfo/:id`} 
                  element={<TechInfo category={category} />} 
                />
                <Route 
                  path={`/${category}/golive`} 
                  element={<GoLive category={category} />} 
                />
                <Route 
                  path={`/${category}/golive/:id`} 
                  element={<GoLive category={category} />} 
                />
                <Route 
                  path={`/${category}/voucherdesign`} 
                  element={<GoLive category={category} />} 
                />
                <Route 
                  path={`/${category}/voucherdesign/:id`} 
                  element={<GoLive category={category} />} 
                />
              </React.Fragment>
            ))}

            {/* Bulk Upload Routes */}
            <Route path="/bulkuploadproduct" element={<BulkUpload />} />
            <Route path="/productbulkupload" element={<BulkUpload />} />
            {bulkUploadCategories.map(({ path, category }) => (
              <React.Fragment key={path}>
                <Route 
                  path={`/${path}`} 
                  element={<BulkUpload category={category} />} 
                />
                <Route 
                  path={`/${category}Bulkuploadshowproducts`} 
                  element={<BulkUpload category={category} />} 
                />
              </React.Fragment>
            ))}
            <Route path="/bulkuploadexcelpreview" element={<BulkUpload />} />
            <Route path="/imageupload" element={<BulkUpload category="textile" />} />

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
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
