import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Plans from "./Plans";

import Bookings from "./Bookings";

import Profile from "./Profile";

import Admin from "./Admin";

import ManagePlans from "./ManagePlans";

import ManageSpaces from "./ManageSpaces";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from './Login.jsx';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Plans: Plans,
    
    Bookings: Bookings,
    
    Profile: Profile,
    
    Admin: Admin,
    
    ManagePlans: ManagePlans,
    
    ManageSpaces: ManageSpaces,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Plans" element={<Plans />} />
                
                <Route path="/Bookings" element={<Bookings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/ManagePlans" element={<ManagePlans />} />
                
                <Route path="/ManageSpaces" element={<ManageSpaces />} />
                
            </Routes>
        </Layout>
    );
}

function RequireAuth({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

export default function Pages() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                    <RequireAuth>
                        <PagesContent />
                    </RequireAuth>
                } />
            </Routes>
        </Router>
    );
}