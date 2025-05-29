import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GameTabsProps {
  openLoginModal: () => void;
}

export default function GameTabs({ openLoginModal }: GameTabsProps) {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="bg-neutral-dark rounded-lg p-4">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          onClick={() => setActiveTab("history")}
          size="sm"
        >
          Game History
        </Button>
        <Button
          variant={activeTab === "bets" ? "default" : "ghost"}
          onClick={() => setActiveTab("bets")}
          size="sm"
        >
          My Bets
        </Button>
        <Button
          variant={activeTab === "wins" ? "default" : "ghost"}
          onClick={() => setActiveTab("wins")}
          size="sm"
        >
          Top Wins
        </Button>
      </div>

      <div className="text-white">
        {activeTab === "history" && (
          <div>
            <h3 className="font-semibold mb-2">Recent Games</h3>
            <p className="text-gray-400">Game history will appear here...</p>
          </div>
        )}
        
        {activeTab === "bets" && (
          <div>
            <h3 className="font-semibold mb-2">My Betting History</h3>
            <p className="text-gray-400">Your betting history will appear here...</p>
          </div>
        )}
        
        {activeTab === "wins" && (
          <div>
            <h3 className="font-semibold mb-2">Top Wins</h3>
            <p className="text-gray-400">Top wins will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
          }
