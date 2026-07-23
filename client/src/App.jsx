import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard";
import SportsPreferences from "./pages/SportsPreferences";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedIn><Dashboard /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn><Dashboard /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
        <Route
          path="/preferences"
          element={
            <>
              <SignedIn><SportsPreferences /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}