import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './components/Home';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AdminDashboard } from './components/AdminDashboard';
import { TrackOrder } from './components/TrackOrder';
import { OrderSuccess } from './components/OrderSuccess';
import { Verify } from './components/Verify';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { MyOrders } from './components/MyOrders';
import { ProfileAddresses } from './components/ProfileAddresses';
import { OrderDetail } from './components/OrderDetail';
import { MobileNav } from './components/MobileNav';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductListing />} />
          <Route path="/shop/:category" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/profile/addresses" element={
            <ProtectedRoute>
              <ProfileAddresses />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders/:id" element={
            <ProtectedRoute adminOnly>
              <OrderDetail />
            </ProtectedRoute>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <MobileNav />
      </BrowserRouter>
    </AuthProvider>
  );
}