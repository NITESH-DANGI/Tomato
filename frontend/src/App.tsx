import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute.tsx";
import PublicRoute from "./components/publicRoute.tsx";
import SelectRole from "./pages/SelectRole.tsx";
import Navbar from "./components/navbar.tsx";
import Account from "./pages/Account.tsx";
import { useAppData } from "./context/AppContext.tsx";
import Restaurant from "./pages/Restaurant.tsx";
const App = () => {
  const { user } = useAppData()

  if (user && user.role === "seller") {
    return <Restaurant />
  }
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
