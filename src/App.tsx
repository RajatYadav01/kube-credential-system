import { BrowserRouter, Routes, Route } from "react-router";
import { IssuancePage } from "./pages/IssuancePage";
import { VerificationPage } from "./pages/VerificationPage";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import NavigationBar from "./components/ui/TabBar";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
      <div className="flex flex-col min-h-full bg-linear-to-b from-cyan-100 via-blue-300 to-indigo-400">
        <Header />
        <NavigationBar />
        <main className="flex-[1_1_auto] w-full md:w-[80%] lg:w-[70%] xl:w-[50%] mx-auto p-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<IssuancePage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
