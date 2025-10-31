import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import Dashboard from "./pages/Dashboard";
import ItemDetail from "./pages/ItemDetail";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/chat/:itemId/:userId" element={<Chat />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
