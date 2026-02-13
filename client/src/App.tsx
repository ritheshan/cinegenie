import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MoviesPage from './pages/MoviesPage';
import MediaDetailsPage from './pages/MediaDetailsPage';
import WatchedPage from './pages/WatchedPage';
import JournalPage from './pages/JournalPage';
import ActorsPage from './pages/ActorsPage';
import ActorDetailsPage from './pages/ActorDetailsPage';
import OAuthCallback from './pages/OAuthCallback';
import NotFoundPage from './pages/NotFoundPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/watched" element={<WatchedPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/actors" element={<ActorsPage />} />
          <Route path="/actors/:id" element={<ActorDetailsPage />} />
          <Route path="/media/:type/:id" element={<MediaDetailsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
