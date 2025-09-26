import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingCart, Minus, Plus, Trash2, Package,EyeOff,Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { loadStripe } from '@stripe/stripe-js';
import { json } from "stream/consumers";
import { useTranslation } from 'react-i18next';

export default function Cart() {
  
  const { t, i18n } = useTranslation();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {

    // Code to run on each render (or when dependencies change)

    return () => {
      // Optional cleanup function
      // This runs before the component unmounts
      // or before the effect re-runs due to dependency changes
    };
  }, [isAuthenticated]);
  
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {

      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      return response.json();
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully. You'll receive a confirmation email shortly.",
      });
      setIsCheckingOut(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = async () => {

    const stripe = await loadStripe("pk_live_51RdqmFAJosTY6SBeGtrKbHfRNQYJdvejjCQye6HhzUDOCbrPWBrW1KUTmuxzdWQzSSNqU7ojjiunzaDaV1aIYiYU00Cf0L90nn");

    if (!stripe) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    });

    if (!response.ok) {
      console.error("Failed to create checkout session");
      return;
    }

    const session = await response.json();
    
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }

  };
  
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
      
      // setTimeout(() => {
      //   if (data?.message?.includes("Admin")) {
      //     window.location.href = "/admin";
      //   } else {
      //     window.location.href = "/";
      //   }
      // }, 100);

    },
    onError: (error: any) => {
      toast({
        title: t('signUpFormFailureMessageTitle'),
        description: error.message || t('signUpFormFailureMessage'),
        variant: "destructive",
      });
    },
  });

  const handleSignUp = (e: React.FormEvent) => {
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

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      // Invalidate the auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: t("signInFormSuccessMessageTitle"),
        description: t("signInFormSuccessMessage"),
      });
      
      // Small delay to ensure query invalidation completes
      // setTimeout(() => {
      //   if (data?.userType === 'admin') {
      //     window.location.href = "/admin";
      //   } else {
      //     window.location.href = "/";
      //   }
      // }, 100);

    },
    onError: (error: any) => {
      toast({
        title: t("signInFormFailureMessageTitle"),
        description: error.message || t("signInFormAdminFailureMessage"),
        variant: "destructive",
      });
    },
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  // const handleCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    
  //   e.preventDefault();
  //   const formData = new FormData(e.currentTarget);

  //   const orderData = {
  //     shippingAddress : {
  //       name: formData.get("name"),
  //       email: formData.get("email"),
  //       address: formData.get("address"),
  //       city: formData.get("city"),
  //       zipCode: formData.get("zipCode"),
  //       country: formData.get("country"),
  //     },
  //     cartItems : cartItems,
  //     totalAmount : getTotalPrice,
  //     notes : formData.get("additionalNotes")
  //   } 
    
  //   createOrderMutation.mutate(orderData);
  // };

  // if (!isAuthenticated) {
  //   return (
  //     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  //       <Card>
  //         <CardContent className="p-8 text-center">
  //           <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
  //           <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
  //           <p className="text-gray-600 mb-6">
  //             You need to be signed in to view your cart.
  //           </p>
  //           <Button onClick={setLoc()}>
  //             Sign In
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t("cartEmptyPageTitle")}</h2>
            <p className="text-gray-600 mb-6">
              {t("cartEmptyPageDesc")}
            </p>
            <Button onClick={() => window.location.href = "/shop"}>
              {t("cartPageContinueBtn")}
            </Button>
          </CardContent>  
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("cartPageMainTitle")}</h1>
        <p className="text-gray-600">{cartItems.length} {t("cartPageMainCounts")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product?.imageUrl || "/placeholder-product.jpg"}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                    {item.design && (
                      <p className="text-sm text-gray-600">Design: {item.design.title}</p>
                    )}
                    {item.customization && (
                      <div className="text-sm text-gray-600">
                        {item.customization.color && (
                          <span>Color: {item.customization.color} </span>
                        )}
                        {item.customization.size && (
                          <span>Size: {item.customization.size}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 border rounded">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-lg">
                          €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("cartPageSummaryTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{t("cartPageSubtotal")}</span>
                <span>€{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("cartPageShipping")}</span>
                <span>€9.99</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("cartPageTotal")}</span>
                  <span>€{(getTotalPrice() + 9.99).toFixed(2)}</span>
                </div>
              </div>
              {isAuthenticated ? (
                <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                // onClick={() => setIsCheckingOut(true)}
                onClick={handleCheckout}
              >
                {t("cartPageProceedBtnCTA")}
              </Button>
              ):(
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setIsSignUp(true)}
              >
                {t("cartPageProceedBtnCTA")}
              </Button>
              )}
             
            </CardContent>
          </Card>

          {/* Production Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Package className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold">{t("cartPageProcessDeatailsTitle")}</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• {t("cartPageProductionTime")}</p>
                <p>• {t("cartPageShippingTime")}</p>
                <p>• {t("cartPageFreeShippingCriteria")}</p>
                <p>• {t("cartPageQualityGuarantee")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{t("cartCheckoutFormTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("cartCheckoutFormInputName")}</Label>
                  <Input id="name" name="name" required placeholder={t("cartCheckoutFormInputNamePlaceholder")} />
                </div>
                <div>
                  <Label htmlFor="email">{t("cartCheckoutFormInputEmail")}</Label>
                  <Input id="email" name="email" type="email" required placeholder={t("cartCheckoutFormInputEmailPlaceholder")} />
                </div>
                <div>
                  <Label htmlFor="address">{t("cartCheckoutFormInputAddress")}</Label>
                  <Textarea id="address" name="address" required placeholder={t("cartCheckoutFormInputAddressPlaceholder")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t("cartCheckoutFormInputCity")}</Label>
                    <Input id="city" name="city" required placeholder={t("cartCheckoutFormInputCityPlaceholder")} />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">{t("cartCheckoutFormInputZipcode")}</Label>
                    <Input id="zipCode" name="zipCode" required placeholder={t("cartCheckoutFormInputZipcodePlaceholder")}/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">{t("cartCheckoutFormInputCountry")}</Label>
                  <Input id="country" name="country" defaultValue="United States" required placeholder={t("cartCheckoutFormInputCountryPlaceholder")} />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">{t("cartCheckoutFormInputAdditionalNotes")}</Label>
                  <Textarea id="additionalNotes" name="additionalNotes" placeholder={t("cartCheckoutFormInputAdditionalNotesPlaceholder")} />
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>{t("cartPageTotal")}</span>
                    <span>€{(getTotalPrice() + 9.99).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? t("cartCheckoutSubmittingBtn") : t("cartCheckoutSubmitBtn")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCheckingOut(false)}
                  >
                    {t("cartCheckoutCancelBtn")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{t("signUpFormTitle")}</CardTitle>
              <CardDescription className="text-center">
                {t("signUpFormDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
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
                <Link href="#">
                  <Button variant="link" className="p-0 h-auto font-semibold"
                  onClick={() => {
                    setIsSignUp(false);  
                    setIsSignIn(true);
                  }}
                  >
                    {t("signUpFormLink")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{t("signInFormTitle")}</CardTitle>
              <CardDescription className="text-center">
                {t("signInFormDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("signInFormInputEmail")} <span className="text-red-600">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("signInFormPlaceholderEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("signInFormInputPassword")} <span className="text-red-600">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("signInFormPlaceholderPassword")}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? t("signInFormBtnBefore") : t("signInFormBtn")}
                </Button>
              </form>
            <div className="mt-4 text-center text-sm">
              {t("signInFormExistAccount")}{" "}
              <Link href="#">
                  <Button variant="link" className="p-0 h-auto font-semibold"
                  onClick={() => {
                    setIsSignIn(false);  
                    setIsSignUp(true);
                  }}
                  >
                    {t("signInFormLink")}
                  </Button>
                </Link>
            </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
