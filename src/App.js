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
import MediaOnlinePhysical from './pages/MediaOnlinePhysical';
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

// Bulk Upload Categories (matches spec Section 7.4; officesupply + path casing per bxi-dashboard)
const bulkUploadCategories = [
  { path: 'textilebulkupload', category: 'textile', showProductsPath: 'textileBulkuploadshowproducts' },
  { path: 'electronicbulkupload', category: 'electronics', showProductsPath: 'electronicBulkuploadshowproducts' },
  { path: 'fmcgbulkupload', category: 'fmcg', showProductsPath: 'fmcgBulkuploadshowproducts' },
  { path: 'officesupplybulkupload', category: 'officesupply', showProductsPath: 'officesupplyBulkuploadshowproducts' },
  { path: 'mobilitybulkupload', category: 'mobility', showProductsPath: 'mobilityBulkuploadshowproducts' },
  { path: 'otherbulkupload', category: 'others', showProductsPath: 'otherBulkuploadshowproducts' },
  { path: 'resturantbulkupload', category: 'restaurant', showProductsPath: 'resturantBulkuploadshowproducts' },
  { path: 'mediaonlinebulkupload', category: 'mediaonline', showProductsPath: 'mediaonlineBulkuploadshowproducts' },
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
            {/* Media Physical – Online vs Offline, Single vs Bulk (per bxi-dashboard MediaOnlinePhysical) */}
            <Route
              path="/media-physical"
              element={
                <ListingAccessGuard kind="product">
                  <MediaOnlinePhysical />
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

            {/* Media-specific routes (multiplex, digital screens, hoarding – per spec 7.2) */}
            <Route path="/mediaonline/mediaonlinemultiplexproductinfo/:id" element={<ListingAccessGuard kind="product" category="mediaonline"><ProductInfo category="mediaonline" /></ListingAccessGuard>} />
            <Route path="/mediaonline/mediamultiplextechinfo/:id" element={<ListingAccessGuard kind="product" category="mediaonline"><TechInfo category="mediaonline" /></ListingAccessGuard>} />
            <Route path="/mediaonline/mediaonlinedigitalscreensinfo/:id" element={<ListingAccessGuard kind="product" category="mediaonline"><ProductInfo category="mediaonline" /></ListingAccessGuard>} />
            <Route path="/mediaonline/mediaonlinedigitalscreenstechinfo/:id" element={<ListingAccessGuard kind="product" category="mediaonline"><TechInfo category="mediaonline" /></ListingAccessGuard>} />
            <Route path="/mediaonline/digitalscreensgolive/:id" element={<ListingAccessGuard kind="product" category="mediaonline"><GoLive category="mediaonline" /></ListingAccessGuard>} />
            <Route path="/mediaoffline/mediaofflinehoardinginfo/:id" element={<ListingAccessGuard kind="product" category="mediaoffline"><ProductInfo category="mediaoffline" /></ListingAccessGuard>} />
            <Route path="/mediaoffline/mediaofflinehoardingtechinfo/:id" element={<ListingAccessGuard kind="product" category="mediaoffline"><TechInfo category="mediaoffline" /></ListingAccessGuard>} />
            <Route path="/mediaoffline/hoardingsgolive/:id" element={<ListingAccessGuard kind="product" category="mediaoffline"><GoLive category="mediaoffline" /></ListingAccessGuard>} />
            <Route path="/mediaoffline/mediaofflineproductinfo/:id" element={<ListingAccessGuard kind="product" category="mediaoffline"><ProductInfo category="mediaoffline" /></ListingAccessGuard>} />

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

            {/* Hotel voucher specific routes (spec 7.3: hotelsproductinfo, hotelstechinfo, hotelsgolive) */}
            <Route path="/hotelsVoucher/hotelsproductinfo/:id" element={<ListingAccessGuard kind="voucher" category="hotelsVoucher"><ProductInfo category="hotelsVoucher" /></ListingAccessGuard>} />
            <Route path="/hotelsVoucher/hotelstechinfo/:id" element={<ListingAccessGuard kind="voucher" category="hotelsVoucher"><TechInfo category="hotelsVoucher" /></ListingAccessGuard>} />
            <Route path="/hotelsVoucher/hotelsgolive/:id" element={<ListingAccessGuard kind="voucher" category="hotelsVoucher"><GoLive category="hotelsVoucher" /></ListingAccessGuard>} />

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
            {bulkUploadCategories.map(({ path, category, showProductsPath }) => (
              <React.Fragment key={path}>
                <Route 
                  path={`/${path}`} 
                  element={
                    <ListingAccessGuard kind="product" category={category}>
                      <BulkUpload category={category} />
                    </ListingAccessGuard>
                  } 
                />
                {showProductsPath && (
                  <Route 
                    path={`/${showProductsPath}`} 
                    element={
                      <ListingAccessGuard kind="product" category={category}>
                        <BulkUpload category={category} />
                      </ListingAccessGuard>
                    } 
                  />
                )}
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
