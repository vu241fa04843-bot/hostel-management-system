
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AddStudent from "./pages/AddStudent";
import Students from "./pages/Students";
import EditStudent from "./pages/EditStudent";
import Rooms from "./pages/Rooms";
import Fees from "./pages/Fees";
import Complaints from "./pages/Complaints";
import MessManagement from "./pages/MessManagement";
import Attendance from "./pages/Attendance";
import Outings from "./pages/Outings";
import Holidays from "./pages/Holidays";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentProfile from "./pages/StudentProfile";
import StudentFees from "./pages/StudentFees";
import StudentComplaints from "./pages/StudentComplaints";
import StudentOutings from "./pages/StudentOutings";
import StudentHolidays from "./pages/StudentHolidays";
import StudentMessMenu from "./pages/StudentMessMenu";
import StudentMealHistory from "./pages/StudentMealHistory";
import StudentAttendance from "./pages/StudentAttendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin pages */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/add-student" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AddStudent />
          </ProtectedRoute>
        } />

        <Route path="/students" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Students />
          </ProtectedRoute>
        } />

        <Route path="/edit-student/:id" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EditStudent />
          </ProtectedRoute>
        } />

        <Route path="/rooms" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Rooms />
          </ProtectedRoute>
        } />

        <Route path="/fees" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Fees />
          </ProtectedRoute>
        } />

        <Route path="/complaints" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Complaints />
          </ProtectedRoute>
        } />

        <Route path="/mess" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <MessManagement />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Attendance />
          </ProtectedRoute>
        } />

        <Route path="/outings" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Outings />
          </ProtectedRoute>
        } />

        <Route path="/holidays" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Holidays />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Student pages */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student-profile" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentProfile />
          </ProtectedRoute>
        } />

        <Route path="/student-fees" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentFees />
          </ProtectedRoute>
        } />

        <Route path="/student-complaints" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentComplaints />
          </ProtectedRoute>
        } />

        <Route path="/student-outings" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentOutings />
          </ProtectedRoute>
        } />

        <Route path="/student-holidays" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentHolidays />
          </ProtectedRoute>
        } />

        <Route path="/student-mess-menu" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentMessMenu />
          </ProtectedRoute>
        } />

        <Route path="/student-meal-history" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentMealHistory />
          </ProtectedRoute>
        } />

        <Route path="/student-attendance" element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentAttendance />
          </ProtectedRoute>
        } />

        {/* Unknown page */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
