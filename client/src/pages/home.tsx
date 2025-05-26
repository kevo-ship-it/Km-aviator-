import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import AuthModal from "@/components/auth-modal";
import UserHeader from "@/components/user-header";
import GameArea from "@/components/game-area";
import BettingControls from "@/components/betting-controls";
import GameTabs from "@/components/game-tabs";
import MobileNavigation from "@/components/mobile-navigation";

export default function Home() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");
  
  const openLoginModal = () => {
    setAuthView("login");
    setAuthModalOpen(true);
  };
  
  const openRegisterModal = () => {
    setAuthView("register");
    setAuthModalOpen(true);
  };
  
  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light">
      {/* Header */}
      <UserHeader 
        openLoginModal={openLoginModal} 
        openRegisterModal={openRegisterModal} 
      />
      
      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Game Area (70% on desktop, 100% on mobile) */}
        <div className="w-full md:w-2/3 p-4">
          <GameArea />
          <BettingControls 
            openLoginModal={openLoginModal} 
          />
        </div>
        
        {/* Sidebar/Info Area (30% on desktop, bottom on mobile) */}
        <div className="w-full md:w-1/3 p-4">
          <GameTabs openLoginModal={openLoginModal} />
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        view={authView}
        onChangeView={setAuthView}
      />
    </div>
  );
}
