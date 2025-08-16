import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Shirt, Star, Users } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Landing() {

  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col">
    
      {/* Header */}
      {/* <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ArtistMarket</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="primary" className="mb-4 bg-primary text-white">
            {t("homeMainTagline")}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t("homeMainTitle")} 
            <span className="text-blue-600"> {t("homeMainTitleLastPart")}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("homeMainDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="min-w-[200px]">
                {t("homeMainSectionSignup")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                {t("homeMainSectionLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("homeServicesTitle")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("homeServicesDesc")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Shirt className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t("homeServicesCardFirstTitle")}</CardTitle>
              <CardDescription>
                {t("homeServicesCardFirstDesc")}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t("homeServicesCardSecondTitle")}</CardTitle>
              <CardDescription>
                {t("homeServicesCardSecondDesc")}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Palette className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t("homeServicesCardThirdTitle")}</CardTitle>
              <CardDescription>
                {t("homeServicesCardThirdDesc")}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t("homeServicesCardFourthTitle")}</CardTitle>
              <CardDescription>
                {t("homeServicesCardFourthDesc")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
              {t("homeCreateTitle")}
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg mb-8">
              {t("homeCreateDesc")}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="min-w-[200px]">
                   {t("homeCreateBtnlogin")}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white text-gray-900">
                   {t("homeCreateBtnsignup")}
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>
   
    </div>
  );
}