import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/user/Dashboard';
import UploadResume from './pages/user/UploadResume';
import JobDescription from './pages/user/JobDescription';
import Matcher from './pages/user/Matcher';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import HRDashboard from './pages/hr/HRDashboard';
import HRUpload from './pages/hr/HRUpload';
import HRJobDescription from './pages/hr/HRJobDescription';
import Leaderboard from './pages/hr/Leaderboard';
import Applicants from './pages/hr/Applicants';

function Spinner() {
  return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spin" style={{ width:40,height:40,border:'4px solid #e5e7eb',borderTopColor:'#6366f1',borderRadius:'50%' }}/></div>;
}
function AppLayout({ children }) {
  return (
    <div style={{ display:'flex',minHeight:'100vh' }}>
      <Sidebar/>
      <main style={{ flex:1,background:'var(--bg-page)',padding:32,overflowY:'auto',minHeight:'100vh' }}>{children}</main>
    </div>
  );
}
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner/>;
  if (!user) return <Navigate to="/login" replace/>;
  if (allowedRole && user.role!==allowedRole) return <Navigate to={user.role==='hr'?'/hr/dashboard':'/dashboard'} replace/>;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner/>;
  const home = user?.role==='hr' ? '/hr/dashboard' : '/dashboard';
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} replace/> : <Login/>}/>
      <Route path="/dashboard" element={<ProtectedRoute allowedRole="user"><AppLayout><Dashboard/></AppLayout></ProtectedRoute>}/>
      <Route path="/upload"    element={<ProtectedRoute allowedRole="user"><AppLayout><UploadResume/></AppLayout></ProtectedRoute>}/>
      <Route path="/jd"        element={<ProtectedRoute allowedRole="user"><AppLayout><JobDescription/></AppLayout></ProtectedRoute>}/>
      <Route path="/matcher"   element={<ProtectedRoute allowedRole="user"><AppLayout><Matcher/></AppLayout></ProtectedRoute>}/>
      <Route path="/history"   element={<ProtectedRoute allowedRole="user"><AppLayout><History/></AppLayout></ProtectedRoute>}/>
      <Route path="/profile"   element={<ProtectedRoute><AppLayout><Profile/></AppLayout></ProtectedRoute>}/>
      <Route path="/hr/dashboard"   element={<ProtectedRoute allowedRole="hr"><AppLayout><HRDashboard/></AppLayout></ProtectedRoute>}/>
      <Route path="/hr/upload"      element={<ProtectedRoute allowedRole="hr"><AppLayout><HRUpload/></AppLayout></ProtectedRoute>}/>
      <Route path="/hr/jd"          element={<ProtectedRoute allowedRole="hr"><AppLayout><HRJobDescription/></AppLayout></ProtectedRoute>}/>
      <Route path="/hr/leaderboard" element={<ProtectedRoute allowedRole="hr"><AppLayout><Leaderboard/></AppLayout></ProtectedRoute>}/>
      <Route path="/hr/applicants"  element={<ProtectedRoute allowedRole="hr"><AppLayout><Applicants/></AppLayout></ProtectedRoute>}/>
      <Route path="*" element={<Navigate to={user ? home : '/login'} replace/>}/>
    </Routes>
  );
}
