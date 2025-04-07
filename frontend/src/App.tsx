import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Navigation";
import TestComponent from "./components/TestComponent";
import AdminPanel from "./components/Admin/AdminPanel";
import UsersList from "./components/Admin/UsersList";
import { Toaster } from "sonner";
import AdminDashboard from "./components/Admin/AdminDashboard";
import LandingPage from "./components/LandingPage";
import Unauthorized from "./components/Unauthorized";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col text-primary">
          <Navigation />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "superVera"]}>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superVera"]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              >
                {/* nesting routes inside admin path */}
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersList />} />
              </Route>
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* Other routes... */}
            </Routes>
          </main>
          <Toaster position="top-right" duration={3000} richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
