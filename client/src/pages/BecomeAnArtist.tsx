import { useState } from "react";
import { useQuery,useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload,Search, UserPlus,Star, ArrowRight,User, Users, Palette, ShoppingBag, Zap, ArrowDown } from "lucide-react";

import ArtistCard from "@/components/ArtistCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation,Link } from "wouter";
import { useTranslation } from 'react-i18next';

export default function BecomeAnArtist() {

    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isCreatingArtist, setIsCreatingArtist] = useState(true);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [bio, setBio] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [instagram, setInstagram] = useState("");
    const [website, setWebsite] = useState("");

    const { data: artist } = useQuery({
      queryKey: ["/api/artists/me"],
      enabled: isAuthenticated,
    });
    
    const { data: artists = [], isLoading } = useQuery({
      queryKey: ["/api/artists"],
    });

    const createArtistMutation = useMutation({
      
      mutationFn: async (formData: any) => {
       
        const response = await fetch("/api/artists", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to upload design");
        return response.json();
      },
    
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Artist profile created successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/artists/me"] });
        setIsCreatingArtist(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  
    const handleCreateArtist = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!uploadedFile) return;
      const formData = new FormData(e.currentTarget);

      formData.append("image", uploadedFile);
      createArtistMutation.mutate(formData);

    };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
     {/* Header */}

      <div className="mt-6">
        
        <h1 className="max-w-4xl text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">{t("becomeanartistPagePrimaryTitle")}</h1>
        <p className="max-w-4xl text-lg text-gray-600 mb-8">
          {t("becomeanartistPagePrimaryDesc")}
        </p>
        <h3 className="max-w-4xl text-2xl md:text-2xl font-bold text-gray-900 mb-4">{t("becomeanartistBecomePartnerTitle")}</h3>
        <ul className="max-w-4xl">
          <li className="mt-3"><b>{t("becomeanartistPartnerStepFirst")} </b>{t("becomeanartistPartnerStepFirstDesc")}</li>
          <li className="mt-3"><b>{t("becomeanartistPartnerStepSecond")} </b>{t("becomeanartistPartnerStepSecondDesc")}</li>
          <li className="mt-3"><b>{t("becomeanartistPartnerStepThird")} </b>{t("becomeanartistPartnerStepThirdDesc")}</li>
          <li className="mt-3"><b>{t("becomeanartistPartnerStepFour")} </b>{t("becomeanartistPartnerStepFourDesc")}</li>
        </ul>

          {/* {isAuthenticated && (
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setLocation("#how-it-works")}
            >
             <Link className="bg-primary hover:bg-primary/90" href="#how-it-works">
                How it works
            </Link>
            <ArrowDown className="h-4 w-4 mr-2" />
            </Button>
          )} */}
        
      </div>

    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Customization Panel */}
        
        { isCreatingArtist && (

           <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  {t("becomeanartistFormTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Artwork Type Selection */}

                <form onSubmit={handleCreateArtist} className="space-y-4">

                  <div>
                    <Label htmlFor="specialty">{t("becomeanartistFormInputSpeciality")}</Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={t("becomeanartistFormInputSpecialityPlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">{t("becomeanartistFormInputBiography")}</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t("becomeanartistFormInputBiographyPlaceholder")}
                      required
                    />
                  </div>

                  {/* File Portfolio */}
                  <div>
                    <Label htmlFor="file-upload">{t("becomeanartistFormUploadPortfolio")}</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          {uploadedFile ? uploadedFile.name : t("becomeanartistFormUploadPortfolioPlaceholder")}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">PNG, JPG, SVG up to 10MB</p>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="website">{t("becomeanartistFormInputWebsite")}</Label>
                    <Input
                      id="website"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder={t("becomeanartistFormInputWebsitePlaceholder")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">{t("becomeanartistFormInputInstagram")}</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder={t("becomeanartistFormInputInstagramPlaceholder")}
                    />
                  </div>

                  <div className="flex space-x-4 justify-end">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCreatingArtist(false)}
                    >
                      {t("becomeanartistFormBtnCancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createArtistMutation.isPending}
                    >
                      {createArtistMutation.isPending ? t("becomeanartistFormBtnSumiting") : t("becomeanartistFormBtnSumit")}
                    </Button>
                  </div>

                </form>
                
              </CardContent>
            </Card>
        </div>
          
        )}

        {!isCreatingArtist && ( <div className="py-8 space-y-6 inline-block"> </div> )}
        
        <div className="py-8 space-y-6 inline-block">
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("becomeanartistPageSecondaryTitle")}</h1>
              <p className="text-xl text-gray-600">{t("becomeanartistPageSecondaryDesc")}</p>
            </div>
          
          {!isCreatingArtist && !artist && (
            <div className="text-center py-8">
              <Button onClick={() => setIsCreatingArtist(true)}>
                <User className="h-4 w-4" />
                Create Artist Profile
              </Button>
            </div>
          ) } 

        </div>
        
      </div>
    </div>

    <section className="py-16 bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("becomeanartistHowITworksTitle")}</h2>
          <p className="text-xl text-gray-600">{t("becomeanartistHowITworksTagline")}</p>
        </div>

        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {[
              { step: 1, title: t("becomeanartistHIWStepFirstH"), desc: t("becomeanartistHIWStepFirstD"), icon: '', color: "bg-primary" },
              { step: 2, title: t("becomeanartistHIWStepSecondH"), desc: t("becomeanartistHIWStepSecondD"), icon: Palette, color: "bg-secondary" },
              { step: 3, title: t("becomeanartistHIWStepThirdH"), desc: t("becomeanartistHIWStepThirdD"), icon: Zap, color: "bg-accent" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`${item.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-12">
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("ShareArtTitle")}</h2>
        <p className="text-lg text-blue-100 mb-6">
          {t("ShareArtDesc")}
        </p>
        
        <div className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">30%</div>
              <div className="text-sm text-blue-100">{t("ShareArtCommissionDesc")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-blue-100">{t("ShareArtSupportDesc")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{t("ShareArtJoinTitle")}</div>
              <div className="text-sm text-blue-100">{t("ShareArtJoinDesc")}</div>
            </div>
          </div>
          
          {isAuthenticated && !artist &&(
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-gray-900 hover:bg-white hover:text-primary"
              onClick={() => setIsCreatingArtist(true)}
            >
              {t("ShareArtBtn")}
            </Button>
          )}
        </div>

      </div>
      
    </div>

    </>
    

  );

}
