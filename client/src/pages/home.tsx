import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import UserHeader from "@/components/user-header";
import GameArea from "@/components/game-area";
import BettingControls from "@/components/betting-controls";
import GameTabs from "@/components/game-tabs";
import MobileNavigation from "@/components/mobile-navigation";
import AuthModal from "@/components/auth-modal";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, view: "login" as "login" | "register" | "forgot" });

  const openLoginModal = () => setAuthModal({ isOpen: true, view: "login" });
  const openRegisterModal = () => setAuthModal({ isOpen: true, view: "register" });
  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral">
      <UserHeader 
        openLoginModal={openLoginModal}
        openRegisterModal={openRegisterModal}
      />

      <main className="max-w-7xl mx-auto p-4">
        {user ? (
          <>
            <GameArea />
            <BettingControls />
            <GameTabs />
          </>
        ) : (
          <div className="text-center text-white space-y-4 py-10">
            <p className="text-lg">Welcome to KM Aviator!</p>
            <div className="space-x-4">
              <button onClick={openLoginModal} className="bg-primary text-white px-4 py-2 rounded">
                Log In
              </button>
              <button onClick={openRegisterModal} className="bg-secondary text-white px-4 py-2 rounded">
                Create Account
              </button>
            </div>
          </div>
        )}
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
  
