import { useState } from "react";
import { useQuery,useMutation } from "@tanstack/react-query";
import { useLocation,Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card,CardWithShadow, CardContent,CardHeader, CardTitle  } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

import { Search,Upload, Filter,Quote,User,Palette,ArrowDown,ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DesignCard from "@/components/DesignCard";

import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Quotes() {

  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [ , setLocation] = useLocation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isCreatingCustomQuote, setIsCreatingCustomQuote] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    email: "",
    subject: "",
    description: "",
  });

  const { data : artist,isLoading} = useQuery({
    queryKey: ["/api/artists/me"],
    enabled: isAuthenticated,
  });

  const createCustomQuoteMutation = useMutation({
      
      mutationFn: async (formData: any) => {
       
        console.log(formData);
        const response = await fetch("/api/quotes", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to submit custom quote request.");
        return response.json();
      },
    
      onSuccess: () => {
        toast({
          title: "Success",
          description: "We have received your custom quote successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
        setIsCreatingCustomQuote(true);
         setFormData({ ...formData, title: '' });
        setFormData({ ...formData, email: '' });
        setFormData({ ...formData, subject: '' });
        setFormData({ ...formData, description: '' });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
  });
  
  const handleCreateCustomQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedFile) return;
    const formData = new FormData(e.currentTarget);
    formData.append("attachment", uploadedFile);
    createCustomQuoteMutation.mutate(formData);
  };
 
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t("quotesMainTitle")}
          </h1>

          {/* Top Introduction section */}
          <div className="mb-16 mx-auto">
            <h4 className="font-bold mb-4 md:text-2xl">{t("quotesMainOrderTitle")}</h4>
            <p className="text-lg text-gray-600 mb-8">
              {t("quotesMainOrderDesc")}
            </p>
            <h6 className="font-bold mb-4 md:text-2xl text-2xl">{t("quotesAdvantageTitle")}</h6>
            <ul className="mb-8">
              <li><b>{t("quotesAdvantagePackagingTitle")} </b>{t("quotesAdvantagePackagingDesc")}</li>
              <li><b>{t("quotesAdvantagesDiscountTitle")} </b>{t("quotesAdvantagesDiscountDesc")}</li>
              <li><b>{t("quoteAdvantagesDeliveryTitle")} </b>{t("quoteAdvantagesDeliveryDesc")}</li>
            </ul>

          </div>

      </div>

      <section className="py-16 bg-gray-50">      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Become our section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Customization Panel */}
              
              { isCreatingCustomQuote && (
      
                <div className="space-y-6">
                  <CardWithShadow>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        {t("quoteFormTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Artwork Type Selection */}
      
                      <form onSubmit={handleCreateCustomQuote} className="space-y-4">
      
                        <div>
                          <Label htmlFor="title">{t("quoteFormInputName")}</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("quoteFormPlaceholderName")}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">{t("quoteFormInputEmail")}</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t("quoteFormPlaceholderEmail")}
                            required
                          />
                        </div>
      
                        <div>
                          <Label htmlFor="subject">{t("quoteFormInputSubject")}</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder={t("quoteFormPlaceholderSubject")}
                            required
                          />
                        </div>
      
                        <div>
                          <Label htmlFor="description">{t("quoteFormInputDesc")}</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t("quoteFormPlaceholderDesc")}
                            required
                          />
                        </div>
      
                         <div>
                            <Label htmlFor="image-url">{t("quoteFormFieldImage")}</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              
                              <input
                                id="image-url"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                              />
                              <label htmlFor="image-url" className="cursor-pointer">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">
                                  {uploadedFile ? uploadedFile.name : t("quoteFormPlaceholderImage")}
                                </p>
                              </label>
                            </div>
                          </div>
      
                        <div className="flex space-x-4 justify-end">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsCreatingCustomQuote(false)}
                          >
                            {t("quoteFormBtnCancel")}
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createCustomQuoteMutation.isPending}
                          >
                            {createCustomQuoteMutation.isPending ? t("quoteFormBtnSubmitting") : t("quoteFormBtnSubmit")}
                          </Button>
                        </div>
      
                      </form>
                      
                    </CardContent>
                  </CardWithShadow>
                </div>
              )}
      
              {!isCreatingCustomQuote && ( <div className="py-16 space-y-6 inline-block"> </div> )}
              
              <div className="py-16 space-y-6 inline-block">
                  
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("quoteGetCustomTitle")}</h1>
                    <p className="text-xl text-gray-600">{t("quoteGetCustomDesc")}</p>
                  </div>
                
                {!isCreatingCustomQuote && (
                  <div className="text-center py-8">
                    <Button onClick={() => setIsCreatingCustomQuote(true)}>
                      <User className="h-4 w-4" />
                      Get Custom Quote
                    </Button>
                  </div>
                )} 
      
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
              
              {isAuthenticated && !artist ? (
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-gray-900 hover:bg-white hover:text-primary"
                  onClick={() => setLocation("/become-an-artist")}
                >
                  {t("ShareArtBtn")}
                </Button>
              ) : !isAuthenticated ? ( 
                <Link href="/signup">
                  <Button size="lg" className="mt-4 min-w-[200px]">
                    {t("ShareArtBtn")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                ) : ('')}
            </div>
    
          </div>
          
      </div>

    </>
  
  );
}
