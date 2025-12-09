import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import SectionsPage from './pages/SectionsPage';
import InstructorsPage from './pages/InstructorsPage';
import RoomsPage from './pages/RoomsPage';
import TimeslotsPage from './pages/TimeslotsPage';
import AddSchedulePage from './pages/AddSchedulePage';
import ViewSchedulePage from './pages/ViewSchedulePage';
import ConflictsPage from './pages/ConflictsPage';

const queryClient = new QueryClient();

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/sections', label: 'Sections' },
    { to: '/instructors', label: 'Instructors' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/timeslots', label: 'Timeslots' },
    { to: '/schedule/add', label: 'Add Schedule' },
    { to: '/schedule/view', label: 'View Schedule' },
    { to: '/conflicts', label: 'Conflicts' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen text-slate-900">
          {/* Navigation */}
          <nav
            className={`sticky top-0 z-40 border-b transition-all duration-300 ${
              scrolled
                ? 'bg-white shadow-lg border-orange-100/80'
                : 'bg-white shadow-sm border-orange-50/80'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-200/60 flex items-center justify-center text-white font-bold">
                    CS
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold leading-tight">Class Schedule</p>
                    <p className="text-xs text-slate-500">University Timetable Manager</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  {navLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                          isActive
                            ? 'text-slate-900 bg-orange-50 border border-orange-100 shadow-sm shadow-orange-200/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/70'
                        }`
                      }
                    >
                      {item.label}
                      <span className="absolute left-3 right-3 -bottom-1 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Accent gradient strip */}
          <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-md shadow-orange-200/50" />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/sections" element={<SectionsPage />} />
              <Route path="/instructors" element={<InstructorsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/timeslots" element={<TimeslotsPage />} />
              <Route path="/schedule/add" element={<AddSchedulePage />} />
              <Route path="/schedule/view" element={<ViewSchedulePage />} />
              <Route path="/conflicts" element={<ConflictsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

