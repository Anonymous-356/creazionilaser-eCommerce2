import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import '../i18n/i18n'; // initialize i18n
import { useTranslation } from 'react-i18next';

import { 
  ShoppingCart,
  ShoppingBag,
  List ,
  Palette,
  Search,
  Contact2Icon,
  Quote,
  GiftIcon,
  Menu,
  X,
  Users,
  User,
  ImagePlus,
  GalleryThumbnails,
  Handshake, 
  Languages,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Navbar() {


  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const [ isLoading,setLocation] = useLocation();

  const { data: artistProfile } = useQuery({
    queryKey: ["/api/artists/me"],
    enabled: isAuthenticated,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      setLocation("/");
      window.location.reload(); // Refresh to clear auth state
    },
  });

  const navigation = [
    { name: t("headerNavLinkHome"), href: "/" },
    { name: t("headerNavLinkShop"), href: "/shop" },
    { name: t("headerNavLinkAbout"), href: "/how-it-works" },
    { name: t("headerNavLinkArtistGallery"), href: "#",listItems: [
          {name: t("headerSubNavLinkDiscoverArtist"), href: "/artists"},
          {name: t("headerSubNavLinkExploreDesign"), href: "/designs"},
          {name: t("headerSubNavLinkBecomeArtist"), href: "/become-an-artist"}     
      ]
    },
    { name: t("headerNavLinkCustomizeProduct"), href: "/create"},
    { name: t("headerNavLinkServices"), href: "#",listItems: [
          {name: t("headerSubNavLinkFaqs"), href: "/faqs"},
          {name: t("headerSubNavLinkIdeas"), href: "#"} ,
          {name: t("headerSubNavLinkContact"), href: "/contact"},
          {name: t("headerSubNavLinkHowWorks"), href: "/how-it-works"},
          {name: t("headerSubNavLinkQuotes"), href: "/custom-quotes"}
      ]
    },
    ...((user as any)?.userType === 'admin' ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  const [location] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (

    isAuthenticated ? 

    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
          {/* <div className="flex items-center h-16"> */}

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img
                  src="/uploads/86c865afac2283f69423030f427ef09a"
                  alt="Logo Image"
                  className="h-16 w-20"
              />
            </Link>
          </div>

          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (

              
              (item.href === '/shop' || item.href === '/create') ?
              <Link key={item.name} href={item.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium inline-flex transition-colors cursor-pointer ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  { item.href == '/shop' ? <ShoppingBag className="h-5 w-5 mr-2" /> : ''}
                  { item.href == '/create' ? <ImagePlus className="h-5 w-5 mr-2" /> : ''}
                  {item.name}
                </span>
              </Link>

              : (item.name === 'Artist Gallery' || item.name === 'Galleria Artisti') ?

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="primary" size="sm">
                    <GalleryThumbnails className="h-5 w-5 mr-0" />
                    <span className={`ml-2 hidden sm:inline ${location === item.href ? "text-primary" : "text-gray-700 hover:text-primary" }`}>
                      {item.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                
                {item.listItems?.map((litems) => (
                    <DropdownMenuItem className={`cursor-pointer hover:bg-primary ${location === litems.href ? "text-primary" : "text-gray-700 hover:text-primary" }`} asChild>
                      <Link href={litems.href} >
                        { litems.href == '/artists' ? <Users className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '/designs' ? <ImagePlus className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '/become-an-artist' && !artistProfile ? <Handshake className="h-5 w-5 mr-2" /> : ''} 
                        { litems.href == '/become-an-artist' && !artistProfile ? litems.name : '' }
                        { litems.href != '/become-an-artist' ? litems.name : '' }

                      </Link>
                    </DropdownMenuItem>
                    
                ))}
                </DropdownMenuContent>
              </DropdownMenu>

              : (item.name === 'Services' || item.name === 'Servizi') ?

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="primary" size="sm">
                    <List className="h-5 w-5 mr-0" />
                    <span className={`ml-2 hidden sm:inline ${location === item.href ? "text-primary" : "text-gray-700 hover:text-primary" }`}>
                      {item.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                
                {item.listItems?.map((litems) => (
                    <DropdownMenuItem asChild>
                      <Link href={litems.href} className="cursor-pointer">
                        { litems.href == '/faqs' ? <Users className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '#' ? <GiftIcon className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '/contact' ? <Contact2Icon className="h-5 w-5 mr-2" /> : ''} 
                        { litems.href == '/how-it-works' ? <Handshake className="h-5 w-5 mr-2" /> : ''} 
                        { litems.href == '/custom-quotes' ? <Quote className="h-5 w-5 mr-2" /> : ''} 
                        { litems.name }
                      </Link>
                    </DropdownMenuItem>
                    
                ))}
                </DropdownMenuContent>
              </DropdownMenu>

              :

              ''

            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-1">

            {/* Desktop Search */}
            {/* <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-gray-100 border-0 focus:bg-white"
                />
              </form>
            </div> */}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </Link>



            {/* User Menu */}
            {isAuthenticated ? (
              <>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                      {/* <span className="ml-2 hidden sm:inline">
                        {(user as any)?.firstName || "User"}
                      </span> */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        {t("headerSubNavLinkProfile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-4 py-1.5" variant="outline" size="md">
                      <Languages />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[4rem]">
                    <DropdownMenuItem asChild>
                      <button onClick={() => changeLanguage('en')} className="mx-2 px-3 py-2 bg-blue-500 text-white rounded">
                        En
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button onClick={() => changeLanguage('it')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded mt-2">
                        It
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </>
              
            ) : (

              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("headerNavLinkLogin")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t("headerNavLinkSignup")}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-4 py-1.5" variant="outline" size="md">
                      <Languages />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[4rem]">
                    <DropdownMenuItem asChild>
                      <button onClick={() => changeLanguage('en')} className="mx-2 px-3 py-2 bg-blue-500 text-white rounded">
                        En
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button onClick={() => changeLanguage('it')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded mt-2">
                        It
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

          </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={`block px-3 py-2 text-base font-medium transition-colors cursor-pointer ${
                      location === item.href
                        ? "text-primary bg-primary/10"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Search */}
              {/* <div className="px-3 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </form>
              </div> */}

            </div>
          </div>
        )}

      </nav>
    </header>

    :

    <header className="container mx-auto px-4 py-6">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
                src="/uploads/86c865afac2283f69423030f427ef09a"
                alt="Logo Image"
                className="h-16 w-20"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">

            {navigation.map((item) => (

              
              (item.href === '/' || item.href === '/how-it-works') ?

              <Link key={item.name} href={item.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium inline-flex transition-colors cursor-pointer ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {item.name}
                </span>
              </Link>

              :
              
              (item.name === "Services" || item.name === 'Servizi') ?

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="primary" size="sm">
                    <List className="h-5 w-5 mr-0" />
                    <span className={`ml-0 hidden sm:inline ${location === item.href ? "text-primary" : "text-gray-700 hover:text-primary" }`}>
                      {item.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                
                {item.listItems?.map((litems) => (
                    <DropdownMenuItem asChild>
                      <Link href={litems.href} className="cursor-pointer">
                        { litems.href == '/faqs' ? <Users className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '#' ? <GiftIcon className="h-5 w-5 mr-2" /> : ''}
                        { litems.href == '/contact' ? <Contact2Icon className="h-5 w-5 mr-2" /> : ''} 
                        { litems.href == '/how-it-works' ? <Handshake className="h-5 w-5 mr-2" /> : ''} 
                        { litems.href == '/custom-quotes' ? <Quote className="h-5 w-5 mr-2" /> : ''} 
                        { litems.name }
                      </Link>
                    </DropdownMenuItem>
                    
                ))}
                </DropdownMenuContent>
              </DropdownMenu>

                :

              ''

            ))}

            <Link href="/login">
              <Button variant="primary" size="sm">
                {t("headerNavLinkLogin")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                {t("headerNavBtnSignup")}
              </Button>
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-4 py-1.5" variant="outline" size="md">
                    <Languages />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[4rem]">
                  <DropdownMenuItem asChild>
                    <button onClick={() => changeLanguage('en')} className="mx-2 px-3 py-2 bg-blue-500 text-white rounded">
                      En
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button onClick={() => changeLanguage('it')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded mt-2">
                      It
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
          </div>

          
        </div>  

      </nav>
    </header>

  );
}
