import React from "react";
import { useRoutes } from 'react-router-dom';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import './i18n/i18n'; // initialize i18n
import { useTranslation } from 'react-i18next';

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreativeEditorSDKComponent as CreativeEditorSDK } from './CreativeEditorSDK';
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Faqs from "@/pages/Faqs";
import Create from "@/pages/Create";
import Artists from "@/pages/Artists";
import Designs from "@/pages/Designs";
import BecomeAnArtist from "@/pages/BecomeAnArtist";
import PrivacyAndPolicy from "@/pages/PrivacyAndPolicy";
import TermsAndCondition from "@/pages/TermsAndCondition";
import HowITworks from "@/pages/HowITworks";
import GiftIdeas from "@/pages/GiftIdeas";
import Quotes from "@/pages/Quotes";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import Portfolio from "@/pages/Portfolio";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Landing from "@/pages/Landing";
import AdminDashboard from "@/pages/AdminDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import { CartProvider } from "@/hooks/useCart";

function Router() {
  
  // const { t, i18n } = useTranslation();

  // const changeLanguage = (lng) => {
  //   i18n.changeLanguage(lng);
  // };

  const { user, isAuthenticated, isLoading } = useAuth();
  const paths = [ "/" ,"home" , "artists","product","portfolio","designs",
                  "become-an-artist","shop","cart","create",
                  "profile","contact","gift-ideas","how-it-works",
                  "custom-quotes","faqs","privacy-policy","terms-&-condition"];  

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  // Debug logging removed for production

  return (
    <Switch>

      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin">
        {isAuthenticated && (user as any)?.userType === 'admin' ? (
          <AdminDashboard />
        ) : isAuthenticated ? (
          <UnauthorizedAccess />
        ) : (
          <Login />
        )}
      </Route>
     
     {paths.map((path) => {
        return ( 
          <Route key={path} path={path} >
            {isAuthenticated ? (
              <AuthenticatedApp user={user} />
            ) : (
              <InAuthenticatedApp />
            )}
          </Route>
        )
     })}
      
    </Switch>
  );
}

function AuthenticatedApp({ user }: { user: any }) {
  
  const isAdmin = (user as any)?.userType === 'admin';

  // Auto-redirect admins to admin dashboard on root path
  React.useEffect(() => {
    if (isAdmin && window.location.pathname === '/') {
      window.location.href = '/admin';
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen flex flex-col">
      
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={isAdmin ? AdminDashboard : Home} />
          <Route path="/home" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/create" component={CreativeEditorSDK} />
          <Route path="/artists" component={Artists} />
          <Route path="/designs" component={Designs} />
          <Route path="/product" component={Product} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/become-an-artist" component={BecomeAnArtist} />
          <Route path="/profile" component={Profile} />
          <Route path="/cart" component={Cart} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/faqs" component={Faqs} />
          <Route path="/contact" component={Contact} />
          <Route path="/gift-ideas" component={GiftIdeas} />
          <Route path="/how-it-works" component={HowITworks} />
          <Route path="/custom-quotes" component={Quotes} />
          <Route path="/privacy-policy" component={PrivacyAndPolicy} />
          <Route path="/terms-&-condition" component={TermsAndCondition} /> 
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function InAuthenticatedApp() {
  

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/home" component={Landing} />
          <Route path="/faqs" component={Faqs} />
          <Route path="/contact" component={Contact} />
          <Route path="/gift-ideas" component={GiftIdeas} />
          <Route path="/how-it-works" component={HowITworks} />
          <Route path="/custom-quotes" component={Quotes} />
          <Route path="/privacy-policy" component={PrivacyAndPolicy} />
          <Route path="/terms-&-condition" component={TermsAndCondition} /> 
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function UnauthorizedAccess() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8">
        You don't have permission to access the admin panel.
      </p>
      <p className="text-sm text-gray-500">
        Contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
