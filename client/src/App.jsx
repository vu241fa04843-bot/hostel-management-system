
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Admin Pages
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

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Shared Layouts
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
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

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================================= */}
        {/* ADMIN ROUTES WITH SHARED SIDEBAR */}
        {/* ================================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/add-student"
            element={<AddStudent />}
          />

          <Route
            path="/students"
            element={<Students />}
          />

          <Route
            path="/edit-student/:id"
            element={<EditStudent />}
          />

          <Route
            path="/rooms"
            element={<Rooms />}
          />

          <Route
            path="/fees"
            element={<Fees />}
          />

          <Route
            path="/complaints"
            element={<Complaints />}
          />

          <Route
            path="/mess"
            element={<MessManagement />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/outings"
            element={<Outings />}
          />

          <Route
            path="/holidays"
            element={<Holidays />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />
        </Route>

        {/* =================================== */}
        {/* STUDENT ROUTES WITH SHARED SIDEBAR */}
        {/* =================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/student-dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="/student-profile"
            element={<StudentProfile />}
          />

          <Route
            path="/student-fees"
            element={<StudentFees />}
          />

          <Route
            path="/student-complaints"
            element={<StudentComplaints />}
          />

          <Route
            path="/student-outings"
            element={<StudentOutings />}
          />

          <Route
            path="/student-holidays"
            element={<StudentHolidays />}
          />

          <Route
            path="/student-mess-menu"
            element={<StudentMessMenu />}
          />

          <Route
            path="/student-meal-history"
            element={<StudentMealHistory />}
          />

          <Route
            path="/student-attendance"
            element={<StudentAttendance />}
          />
        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
