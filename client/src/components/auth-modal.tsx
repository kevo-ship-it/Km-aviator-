import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "register" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: AuthView;
  onChangeView: (view: AuthView) => void;
}

export default function AuthModal({ isOpen, onClose, view, onChangeView }: AuthModalProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login, register, resetPassword, isLoginPending, isRegisterPending, isResetPending } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (view === "login") {
        await login({ phone, password });
        onClose();
        toast({ title: "Logged in successfully!" });
      } else if (view === "register") {
        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", variant: "destructive" });
          return;
        }
        await register({ phone, password });
        onClose();
        toast({ title: "Account created successfully!" });
      } else if (view === "forgot") {
        await resetPassword({ phone, newPassword: password });
        onClose();
        toast({ title: "Password reset successfully!" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const isLoading = isLoginPending || isRegisterPending || isResetPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-dark border-neutral">
        <DialogHeader>
          <DialogTitle className="text-white">
            {view === "login" && "Login"}
            {view === "register" && "Create Account"}
            {view === "forgot" && "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-neutral-darker border-neutral text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">
              {view === "forgot" ? "New Password" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-darker border-neutral text-white"
              required
            />
          </div>

          {(view === "register" || view === "forgot") && (
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-neutral-darker border-neutral text-white"
                required
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : (
              view === "login" ? "Login" :
              view === "register" ? "Create Account" :
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          {view === "login" && (
            <>
              <button
                type="button"
                onClick={() => onChangeView("register")}
                className="text-blue-400 hover:underline mr-4"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => onChangeView("forgot")}
                className="text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </>
          )}
          {view !== "login" && (
            <button
              type="button"
              onClick={() => onChangeView("login")}
              className="text-blue-400 hover:underline"
            >
              Back to login
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
  }
