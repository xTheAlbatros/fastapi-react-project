import { Container, Navbar as BsNavbar, Nav } from 'react-bootstrap'
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Today from './pages/Today.jsx'
import CalendarPage from './pages/Calendar.jsx'
import Profile from './pages/Profile.jsx'
import StatusWs from './components/StatusWs.jsx'

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return children
}

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <BsNavbar bg="light" expand="lg" className="mb-3 app-navbar full-bleed" sticky="top">
            <Container fluid>
                <BsNavbar.Brand
                    as={Link}
                    to="/"
                    className="d-flex align-items-center gap-2"
                >
                    <img
                        src="/planning.png"
                        alt="Calendar Tasks App"
                        width={28}
                        height={28}
                        className="brand-logo"
                    />
                    <span>Calendar Tasks App</span>
                </BsNavbar.Brand>
                <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BsNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={NavLink} end to="/">
                                    Dzisiejszy task-list
                                </Nav.Link>
                                <Nav.Link as={NavLink} to="/calendar">
                                    Kalendarz
                                </Nav.Link>
                            </>
                        )}
                    </Nav>

                    <div className="d-flex align-items-center gap-3">
                        <StatusWs />
                        {isAuthenticated ? (
                            <>
                                <span className="text-muted">Witaj {user?.first_name || ''}</span>
                                <Nav.Link as={NavLink} to="/profile">Profil</Nav.Link>
                                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                                    Wyloguj
                                </button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={NavLink} to="/login">Logowanie</Nav.Link>
                                <Nav.Link as={NavLink} to="/register">Rejestracja</Nav.Link>
                            </>
                        )}
                    </div>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Container className="py-3">
                <Routes>
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/>} />
                    <Route path="/" element={<ProtectedRoute><Today/></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><CalendarPage/></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Container>
        </AuthProvider>
    )
}