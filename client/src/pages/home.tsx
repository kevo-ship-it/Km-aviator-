import { useState } from "react";
import UserHeader from "@/components/user-header";
import GameArea from "@/components/game-area";
import BettingControls from "@/components/betting-controls";
import GameTabs from "@/components/game-tabs";
import MobileNavigation from "@/components/mobile-navigation";
import AuthModal from "@/components/auth-modal";

export default function Home() {
  const [authModal, setAuthModal] = useState({ isOpen: false, view: "login" as "login" | "register" | "forgot" });

  const openLoginModal = () => setAuthModal({ isOpen: true, view: "login" });
  const openRegisterModal = () => setAuthModal({ isOpen: true, view: "register" });
  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  return (
    <div className="min-h-screen bg-neutral">
      <UserHeader 
        openLoginModal={openLoginModal}
        openRegisterModal={openRegisterModal}
      />
      
      <main className="max-w-7xl mx-auto p-4">
        <GameArea />
        <BettingControls openLoginModal={openLoginModal} />
        <GameTabs openLoginModal={openLoginModal} />
      </main>
      
      <MobileNavigation />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        view={authModal.view}
        onChangeView={(view) => setAuthModal({ ...authModal, view })}
      />
    </div>
  );
}
