import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Signup() {

  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (data: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password: string; 
    }) => {
      return await apiRequest("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: t('signUpFormSuccessMessageTitle'),
        description: t('signUpFormSuccessMessage'),
      });
      
      // Invalidate auth query and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        if (data?.message?.includes("Admin")) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: t('signUpFormFailureMessageTitle'),
        description: error.message || t('signUpFormFailureMessage'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('signUpFormConfirmPassMessageTitle'),
        description: t('signUpFormConfirmPassMessage'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('signUpFormShortPassMessageTitle'),
        description: t('signUpFormShortPassMessage'),
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({ firstName, lastName, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t("signUpFormTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("signUpFormDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("signUpFormInputFirstName")} <span className="text-red-600">*</span></Label>
                <Input
                  id="firstName"
                  placeholder={t("signUpFormPlaceholderFirstName")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("signUpFormInputLastName")} <span className="text-red-600">*</span></Label>
                <Input
                  id="lastName"
                  placeholder={t("signUpFormPlaceholderLastName")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("signUpFormInputEmail")} <span className="text-red-600">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder={t("signUpFormPlaceholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <small className="text-gray-400">Email address must be unique.</small>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("signUpFormInputPassword")} <span className="text-red-600">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("signUpFormPlaceholderPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("signUpFormInputConfirmPass")} <span className="text-red-600">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("signUpFormPlaceholderConfirmPass")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? t("signUpFormBtnBefore") : t("signUpFormBtn")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t("signUpFormExistAccount")}{" "}
            <Link href="/login">
              <Button variant="link" className="p-0 h-auto font-semibold">
                {t("signUpFormLink")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}