import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BettingControlsProps {
  openLoginModal: () => void;
}

export default function BettingControls({ openLoginModal }: BettingControlsProps) {
  const { user } = useAuth();
  const { gameState, activeBet, placeBet, cashout, isPlacingBet, isCashingOut } = useGame();
  const [betAmount, setBetAmount] = useState(50);
  const [autoCashout, setAutoCashout] = useState("");
  const { toast } = useToast();

  const handlePlaceBet = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (betAmount < 10 || betAmount > 20000) {
      toast({
        title: "Invalid bet amount",
        description: "Bet must be between KSh 10 and KSh 20,000",
        variant: "destructive"
      });
      return;
    }

    try {
      await placeBet(betAmount, autoCashout ? Number(autoCashout) : undefined);
      toast({
        title: "Bet placed!",
        description: `KSh ${betAmount} bet placed successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCashout = async () => {
    try {
      await cashout();
      toast({
        title: "Cashed out!",
        description: "Successfully cashed out your bet"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const canPlaceBet = gameState.status === "waiting" && !activeBet;
  const canCashout = gameState.status === "active" && activeBet;

  return (
    <div className="bg-neutral-dark rounded-lg p-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bet Amount (KSh)
          </label>
          <input
            type="number"
            min="10"
            max="20000"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-neutral-darker border border-neutral rounded-md text-white"
            disabled={!canPlaceBet}
          />
        </div>

        {/* Auto Cashout */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Auto Cashout (Optional)
          </label>
          <input
            type="number"
            min="1.1"
            step="0.1"
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            placeholder="2.0x"
            className="w-full px-3 py-2 bg-neutral-darker border border-neutral rounded-md text-white"
            disabled={!canPlaceBet}
          />
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          {canPlaceBet ? (
            <Button
              onClick={handlePlaceBet}
              disabled={isPlacingBet}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPlacingBet ? "Placing..." : `Bet KSh ${betAmount}`}
            </Button>
          ) : canCashout ? (
            <Button
              onClick={handleCashout}
              disabled={isCashingOut}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isCashingOut ? "Cashing out..." : "Cash Out"}
            </Button>
          ) : (
            <Button disabled className="w-full">
              {gameState.status === "active" ? "Flying..." : "Wait for next round"}
            </Button>
          )}
        </div>
      </div>

      {activeBet && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded-md">
          <p className="text-blue-200">
            Active bet: KSh {activeBet.amount}
            {activeBet.autoCashout && ` • Auto cashout at ${activeBet.autoCashout}x`}
          </p>
        </div>
      )}
    </div>
  );
}
