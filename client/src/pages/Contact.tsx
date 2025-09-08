import { useState } from "react";
import { useQuery,useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Card,CardWithShadow, CardContent,CardHeader, CardTitle  } from "@/components/ui/card";
import { Upload,Search, UserPlus,Star, ArrowRight,User, Users, Palette, ShoppingBag, Zap, ArrowDown } from "lucide-react";

import ArtistCard from "@/components/ArtistCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation,Link } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Contact() {

  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [ setLocation] = useLocation();
  const [isCreatingEnquiry, setIsCreatingEnquiry] = useState(true);
  const [sortBy, setSortBy] = useState<string>("name");

  const INITIAL_FORM_STATE = {
    title: "",
    email: "",
    subject: "",
    message: "",
  }
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const { data: artists = [],isLoading } = useQuery({
    queryKey: ["/api/artists"],
  });

  const createEnquiryMutation = useMutation({
      
      mutationFn: async (formData: FormData) => {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) throw new Error(t("enquiryFormFailureMessage"));
        return response.json();
      },

      onSuccess: () => {
        toast({
          title: "Success",
          description: t("enquiryFormSuccessMessage"),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
        queryClient.refetchQueries({ queryKey: ["/api/enquiries"] });
  
        setIsCreatingEnquiry(true);
        setFormData(INITIAL_FORM_STATE);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
  });

  const handleEnquiryQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createEnquiryMutation.mutate(formData);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
          <div className="mb-16 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("contactMainTitle")}</h1>
            <p className="text-lg text-gray-600">
              {t("contactMainDesc")}
            </p>
          </div>

      </div>

      <section className="py-16 bg-gray-50">      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Become our section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <div className="py-16 space-y-6 inline-block">
                  
                  <div className="">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("contactEnquiryTitle")}</h1>
                    <p className="text-xl text-gray-600">{t("contactEnquiryDesc")}</p>
                  </div>
              
              </div>

              {/* Customization Panel */}
              <div className="space-y-6">
                <CardWithShadow>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      {t("EnquiryFormTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Artwork Type Selection */}
    
                      <form onSubmit={handleEnquiryQuote} className="space-y-4">
      
                        <div>
                          <Label htmlFor="title">{t("EnquiryFormInputFullName")} <span className="text-red-600">*</span></Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("EnquiryFormPlaceholderFullName")}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">{t("EnquiryFormInputEmail")} <span className="text-red-600">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t("EnquiryFormPlaceholderEmail")}
                            required
                          />
                        </div>
      
                        <div>
                          <Label htmlFor="subject">{t("EnquiryFormInputSubject")} <span className="text-red-600">*</span></Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder={t("EnquiryFormPlaceholderSubject")}
                            required
                          />
                        </div>
      
                        <div>
                          <Label htmlFor="message">{t("EnquiryFormInputMessage")} <span className="text-red-600">*</span></Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder={t("EnquiryFormPlaceholderMessage")}
                            required
                          />
                        </div>
      
                        <div className="flex space-x-4 justify-end">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsCreatingEnquiry(false)}
                          >
                            {t("FormCancelBtn")}
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createEnquiryMutation.isPending}
                          >
                            {createEnquiryMutation.isPending ? t("FormSubmittingBtn") : t("FormSubmitBtn")}
                          </Button>
                        </div>
      
                      </form>
                    
                  </CardContent>
                </CardWithShadow>
              </div>
              
            </div>
        </div>      
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("HowITWorksTitle")}</h2>
            <p className="text-xl text-gray-600">{t("HowITWorksDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-stagger">
            {[
              { step: 1, title: t("HowITWorksStepFirstTitle"), desc: t("HowITWorksStepFirstDesc"), icon: ShoppingBag, color: "bg-primary" },
              { step: 2, title: t("HowITWorksStepSecondTitle"), desc: t("HowITWorksStepSecondDesc"), icon: Palette, color: "bg-secondary" },
              { step: 3, title: t("HowITWorksStepThirdTitle"), desc: t("HowITWorksStepThirdDesc"), icon: Zap, color: "bg-accent" },
              { step: 4, title: t("HowITWorksStepFourthTitle"), desc: t("HowITWorksStepFourthDesc"), icon: Users, color: "bg-green-500" },
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

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { icon: "🖨️", title: t("HowITWorksPrintTitle"), desc: t("HowITWorksPrintDesc") },
                { icon: "✂️", title: t("HowITWorksEngraveTitle"), desc: t("HowITWorksEngraveDesc") },
                { icon: "📋", title: t("HowITWorksCutTitle"), desc: t("HowITWorksCutDesc") },
              ].map((service) => (
                <div key={service.title} className="text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{service.title}</h4>
                  <p className="text-gray-600">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>

  );

}
