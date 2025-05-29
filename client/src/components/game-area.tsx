import { useGame } from "@/hooks/use-game";

export default function GameArea() {
  const { gameState } = useGame();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-8 h-96 flex items-center justify-center relative overflow-hidden">
      {/* Game Status Display */}
      <div className="text-center text-white">
        {gameState.status === "waiting" && (
          <>
            <div className="text-6xl font-display font-bold mb-4">
              {gameState.countdown || 0}
            </div>
            <div className="text-xl">Next round starting...</div>
          </>
        )}
        
        {gameState.status === "active" && (
          <>
            <div className="text-8xl font-display font-bold mb-4 text-green-400">
              {gameState.multiplier?.toFixed(2)}x
            </div>
            <div className="text-xl">Flying...</div>
          </>
        )}
        
        {gameState.status === "crashed" && (
          <>
            <div className="text-8xl font-display font-bold mb-4 text-red-400">
              {gameState.crashPoint?.toFixed(2)}x
            </div>
            <div className="text-xl">CRASHED!</div>
          </>
        )}
      </div>
      
      {/* Airplane Animation Placeholder */}
      <div className="absolute bottom-4 left-4">
        <div className="text-4xl">✈️</div>
      </div>
    </div>
  );
        }
