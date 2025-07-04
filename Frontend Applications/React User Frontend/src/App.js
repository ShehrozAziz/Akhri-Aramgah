import logo from "./logo.svg";
import "./App.css";
import Login from "./Screens/Login";
import LandingPage from "./Screens/LandingPage";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./Screens/SignUp";
import Dashboard from "./Screens/Dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import Complaints from "./Screens/Complaints";
import Orders from "./Screens/Orders";
import Graves from "./Screens/Graves";
import Settings from "./Screens/Settings";
import BookTransport from "./Screens/BookTransport";
import BookCatering from "./Screens/BookCatering";
import GraveyardMap from "./Components/GraveyardMap";
import BookGrave from "./Screens/BookGrave";
import BookMorgue from "./Screens/BookMorgue";
import SearchMorgue from "./Screens/SearchMorgue";
import PanoramaViewer from "./Screens/PanoramaViewer";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/LogIn" element={<Login></Login>} />
        <Route exact path="/test" element={<PanoramaViewer />} />
        <Route path="/SignUp" element={<SignUp></SignUp>} />
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookGrave"
          element={
            <PrivateRoute>
              <BookGrave />
            </PrivateRoute>
          }
        />
        <Route
          path="/Complaints"
          element={
            <PrivateRoute>
              <Complaints />
            </PrivateRoute>
          }
        />
        <Route
          path="/Orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/Graves"
          element={
            <PrivateRoute>
              <Graves></Graves>
            </PrivateRoute>
          }
        />
        <Route
          path="/Settings"
          element={
            <PrivateRoute>
              <Settings></Settings>
            </PrivateRoute>
          }
        />
        <Route
          path="/BookTransport"
          element={
            <PrivateRoute>
              <BookTransport></BookTransport>
            </PrivateRoute>
          }
        />
        <Route
          path="/BookCatering"
          element={
            <PrivateRoute>
              <BookCatering></BookCatering>
            </PrivateRoute>
          }
        />
        <Route
          path="/BookMorgue"
          element={
            <PrivateRoute>
              <BookMorgue></BookMorgue>
            </PrivateRoute>
          }
        />
        <Route
          path="/SearchMorgue"
          element={
            <PrivateRoute>
              <SearchMorgue></SearchMorgue>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
