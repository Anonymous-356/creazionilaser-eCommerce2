import { useState,useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User,Truck, Package, Palette, Upload, Eye,Users,CirclePoundSterling,HeartPlus,Trash2,ChartLine,Component } from "lucide-react";
import { useTranslation } from 'react-i18next';
import e from "express";


export default function Profile() {

  const { toast } = useToast();
  const { t,i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [formData,setFormData] = useState({});
  const [userFormData,setUserFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingArtist, setIsUpdatingArtist] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUser, setUploadedFileUser] = useState<File | null>(null);
  
  const {data : user } = useQuery({
    queryKey: ["/api/users/me"],
    enabled: isAuthenticated,
  })

  const {data : artist} = useQuery ({
    queryKey: ["/api/artists/me"],
    enabled: isAuthenticated,
  });

  const {data: stats } = useQuery({
    queryKey: ["api/stats/me"],
    enabled: isAuthenticated,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["/api/wishlist/me"],
    enabled: isAuthenticated,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: designs = [] } = useQuery({
    queryKey: ["/api/designs", artist?.id],
    queryFn: async () => {
      if (!artist?.id) return [];
      const response = await fetch(`/api/designs?artist=${artist?.id}`);
      return response.json();
    },
    enabled: !!artist?.id,
  });

  useEffect(() => {

    if (artist) {
      setActiveTab('artist'); // Set local state when data is available

      const INITIAL_ARTIST_FORM_STATE = {
        userId : artist?.userId,
        firstName : artist?.firstName,
        lastName : artist?.lastName  || "",
        email : artist?.email,
        bio : artist?.biography,
        specialty : artist?.specialty,
        imageUrl : artist?.imageUrl || "",
        website : artist?.socialLinks.website || "",
        instagram : artist?.socialLinks.instagram || "",
      }
      
      setFormData(INITIAL_ARTIST_FORM_STATE);
    }

    if(user){
        const INITIAL_USER_FORM_STATE = {
          userId : user?.Id,
          firstName : user?.firstName,
          lastName : user?.lastName  || "",
          email : user?.email,
          imageUrl : user?.profileImageUrl || "",
        }
       setUserFormData(INITIAL_USER_FORM_STATE);
    }

  }, [artist,user]); // Re-run effect when 'artist' updates

  const INITIAL_DESIGN_FORM_STATE = {
    title : "",
    price : "",
    description : "",
  }
  const [designFormData,setDesignFormData] = useState(INITIAL_DESIGN_FORM_STATE);
  
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/users/${user?.id}`,{
          method: "PUT",
          body: data,
          credentials: "include",
        });
        if (!response.ok) throw new Error(t("profileUserFormFailureMessage"));
        return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("profileUserFormSuccessMessage"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setIsUpdatingUser(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateArtistMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/artists/${artist?.id}`,{
          method: "PUT",
          body: data,
          credentials: "include",
        });
        if (!response.ok) throw new Error(t("profileArtistFormFailureMessage"));
        return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("profileArtistFormSuccessMessage"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/artists/me"] });
      setIsUpdatingArtist(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadDesignMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log(formData);
      for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
      }
      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("profileMyDesignFormFailureMessage"));
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("profileMyDesignFormSuccessMessage"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
      setSelectedFile(null);
      setDesignFormData(INITIAL_DESIGN_FORM_STATE);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDesignMutation = useMutation({
      mutationFn: async (designId: number) => {
        const response = await fetch(`/api/design/${designId}`, {
          method: "DELETE",
          credentials: "include",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
        queryClient.refetchQueries({ queryKey: ["/api/designs"] });
        toast({ title: t("Design removed successfully.") });
      },
      onError: (error: any) => {
        toast({ 
          title: "Failed to remove design.",
          description: error.message,
          variant: "destructive"
        });
      },
  });

  const deleteWishlistDesignMutation = useMutation({
      mutationFn: async (wishlistId: number) => {
        const response = await fetch(`/api/wishlist/${wishlistId}`, {
          method: "DELETE",
          credentials: "include",
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist/me"] });
        queryClient.refetchQueries({ queryKey: ["/api/wishlist/me"] });
        toast({ title: t("Wishlist updated successfully.") });
      },
      onError: (error: any) => {
        toast({ 
          title: "Failed to update wishlist.",
          description: error.message,
          variant: "destructive"
        });
      },
  });

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!userFormData.imageUrl && !uploadedFileUser){
      toast({
        title: t('profileFormProfileImageMissingTitle'),
        description: t('profileFormProfileImageMissingMessage'),
        variant: "destructive",
      });
      return; 
    }

    const formData = new FormData(e.currentTarget);
    formData.append("image", uploadedFileUser);
    updateUserMutation.mutate(formData);
  };

  const handleUpdateArtist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!formData.imageUrl && !uploadedFile){
      toast({
        title: t('profileFormProfileImageMissingTitle'),
        description: t('profileFormProfileImageMissingMessage'),
        variant: "destructive",
      });
      return; 
    }

    const artistformData = new FormData(e.currentTarget);
    artistformData.append("image", uploadedFile);
    updateArtistMutation.mutate(artistformData);
  };

  const handleUploadDesign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile){
      toast({
        title: t('profileDesignFormImageMissingTitle'),
        description: t('profileDesignFormImageMissingTitleMessage'),
        variant: "destructive",
      });
      return;  
    }
    const formData = new FormData(e.currentTarget);
    formData.append("image", selectedFile);
    uploadDesignMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access your profile.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("profilePageMainTitle")}</h1>
        <p className="text-gray-600">{t("profilePageMainDesc")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex">
          
          {!artist ? (

            <TabsList className="grid h-full w-72 mr-4 grid-cols-1">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  {t("myAccountUserTabFirst")} 
                </TabsTrigger>
                <TabsTrigger  value="shipping">
                  <Truck className="h-4 w-4 mr-2" />
                  {t("myAccountUserTabSecond")} 
                </TabsTrigger>
                <TabsTrigger  value="wishlist">
                  <HeartPlus className="h-4 w-4 mr-2" />
                  {t("myAccountUserTabThird")} 
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  {t("myAccountUserTabForth")}
                </TabsTrigger>
            </TabsList>

            ) : (

            <TabsList className="grid h-full w-72 mr-4 grid-cols-1">
                <TabsTrigger value="artist">
                  <Palette className="h-4 w-4 mr-2" />
                  {t("myAccountArtistTabFirst")}
                </TabsTrigger>
                <TabsTrigger value="designs" disabled={!artist}>
                  <Component className="h-4 w-4 mr-2" />
                  {t("myAccountArtistTabSecond")}
                </TabsTrigger>
                 <TabsTrigger value="statistics" disabled={!artist}>
                  <ChartLine className="h-4 w-4 mr-2" />
                  {t("myAccountArtistTabThird")}
                </TabsTrigger>  
            </TabsList>
            
          )}
         
          {!artist ? (

            <>

              <TabsContent value="profile" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profileUserTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName">{t("profileUserFirstName")} <span className="text-red-600">*</span></Label>
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  value={userFormData?.firstName}
                                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                                  placeholder={t("profileUserFirstNamePlaceholder")}
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName">{t("profileUserLastName")}</Label>
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  value={userFormData?.lastName}
                                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                                  placeholder={t("profileUserLastNamePlaceholder")}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email">{t("profileUserEmail")} <span className="text-red-600">*</span></Label>
                              <Input
                                id="email"
                                name="email"
                                value={userFormData?.email}
                                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                placeholder={t("profileUserEmailPlaceholder")}
                              />
                            </div>
                            <div>
                                <Label htmlFor="image-url">{t("profileArtistImage")} <span className="text-red-600">*</span></Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <input
                                    name="existingProfileImage"
                                    type="hidden"
                                    className="hidden"
                                    value={userFormData?.imageUrl}
                                  />
                                  <input
                                    id="image-url"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setUploadedFileUser(e.target.files?.[0] || null)}
                                  />
                                  {userFormData?.imageUrl && (
                                    <img  src={userFormData?.imageUrl} alt="Existing Profile Image" className="h-16 w-16" />
                                  )}
                                  <label htmlFor="image-url" className="cursor-pointer">
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">
                                      {uploadedFileUser ? uploadedFileUser.name : t("profileUserImagePlaceholder")}
                                    </p>
                                  </label>
                                </div>
                            </div>
                            <div className="flex space-x-4 justify-end items-end">
                              <Button 
                                type="submit" 
                                disabled={updateUserMutation.isPending}
                              >
                                {updateUserMutation.isPending ? t("profileUserBtnSubmitting") : t("profileUserBtnSubmit")}
                              </Button>
                            
                            </div>
                        </form>
                    </div>
                    
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profileUserOrdersTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profileUserOrdersNoRecordTagline")}</h3>
                        <p className="text-gray-600">{t("profileUserOrdersNoRecordElaborate")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">Order #{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${order.totalAmount}</p>
                                <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="w-full">

                {/* My Wishlist */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profileMyWishlistMainTitle")} ({wishlist.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-8">
                        <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profileMyDesignNoRecordTitle")}</h3>
                        <p className="text-gray-600">{t("profileMyDesignNoRecordDesc")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {wishlist.map((design: any) => (
                          <div key={design.id} className="relative border rounded-lg overflow-hidden">
                            <img src={design.imageUrl} alt={design.title} className="w-full h-32 object-cover" />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex justify-start">
                                <Button 
                                  size="sm"
                                  className="bg-red-500 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWishlistDesignMutation.mutate(design.id);
                                  }}
                                >
                                <Trash2 className="h-4 w-4 items-center" />  
                                </Button>
                              </div>
                              <div className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 ${ design.isPublic === true ? ('bg-green-600') : ('bg-red-600' )} text-white px-6 py-1 font-semibold shadow-lg right-5 top-[16%]`}>
                                {design.isPublic === true ? ('Approved') : ('Pending')}                              
                              </div>
                            <div className="p-3 flex justify-between">
                              <h4 className="font-medium">{design.title} </h4>
                              <Badge variant="secondary" className="ml-2"> €{design.price} </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </TabsContent>

              <TabsContent value="shipping" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profileUserShippingTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profileUserShippingNoRecordTagline")}</h3>
                        <p className="text-gray-600">{t("profileUserShippingNoRecordElaborate")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">Order #{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${order.totalAmount}</p>
                                <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent> 

            </>  
        
            )
            :
            
            (

            <>

              <TabsContent value="artist" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profileArtistTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    
                      <div>

                        <form onSubmit={handleUpdateArtist} className="space-y-4">

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                              <Label htmlFor="firstName">{t("profileArtistFirstName")} <span className="text-red-600">*</span></Label>
                              <Input
                                type="hidden"
                                name="userId"
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                              />
                              <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder={t("profileArtistFirstNamePlaceholder")}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">{t("profileArtistLastName")} <span className="text-red-600">*</span></Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder={t("profileArtistLastNamePlaceholder")}
                                required
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                              <Label htmlFor="email">{t("profileArtistEmail")} <span className="text-red-600">*</span></Label>
                              <Input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t("profileArtistEmailPlaceholder")}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="specialty">{t("profileArtistSpecialty")} <span className="text-red-600">*</span></Label>
                              <Input
                                id="specialty"
                                type="text"
                                name="specialty"
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                placeholder={t("profileArtistSpecialtyPlaceholder")}
                                required
                              />
                            </div>

                          </div>

                          <div>
                            <Label htmlFor="bio">{t("profileArtistBio")} <span className="text-red-600">*</span></Label>
                            <Textarea
                              id="bio"
                              type="textarea"
                              name="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder={t("profileArtistBioPlaceholder")}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="image-url">{t("profileArtistImage")} <span className="text-red-600">*</span></Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <input
                                name="existingProfileImage"
                                type="hidden"
                                className="hidden"
                                value={formData.imageUrl}
                              />
                              <input
                                id="image-url"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                              />
                              {formData.imageUrl && (
                                <img src={formData.imageUrl} alt="Existing Profile Image" className="h-16 w-16" />
                              )}
                              <label htmlFor="image-url" className="cursor-pointer">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">
                                  {uploadedFile ? uploadedFile.name : t("profileArtistImagePlaceholder")}
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="website">{t("profileArtistWebsite")}</Label>
                              <Input
                                id="website"
                                name="website"
                                type="text"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website : e.target.value })}
                                placeholder={t("profileArtistWebsitePlaceholder")}
                              />
                            </div>
                            <div>
                              <Label htmlFor="instagram">{t("profileArtistInstagram")}</Label>
                              <Input
                                id="instagram"
                                name="instagram"
                                type="text"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram : e.target.value })}
                                placeholder={t("profileArtistInstagramPlaceholder")}
                              />
                            </div>
                          </div>

                          <div className="flex space-x-4 justify-end items-end">
                            <Button 
                              type="submit" 
                              disabled={updateArtistMutation.isPending}
                            >
                              {updateArtistMutation.isPending ? t("profileArtistBtnSubmitting") : t("profileArtistBtnSubmit")}
                            </Button>
                            {/* <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setIsUpdatingArtist(false)}
                            >
                              {t("profileArtistBtnCancel")}
                            </Button> */}
                          </div>

                        </form>

                      </div>

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="designs" className="w-full">
                <div className="space-y-6">

                  {/* Upload New Design */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("profileMyDesignMainTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent>

                      <form onSubmit={handleUploadDesign} className="space-y-4">
                        
                        <div>
                          <Label htmlFor="design-title">{t("profileMyDesignTitle")} <span className="text-red-600">*</span></Label>
                          <Input
                            id="design-title"
                            name="title"
                            placeholder={t("profileMyDesignTitlePlaceholder")}
                            value={designFormData.title}
                            onChange={(e) => setDesignFormData({ ...designFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="design-description">{t("profileMyDesignDesc")}</Label>
                          <Textarea
                            id="design-description"
                            name="description"
                            placeholder={t("profileMyDesignDescPlaceholder")}
                            value={designFormData.description}
                            onChange={(e) => setDesignFormData({ ...designFormData, description: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="design-price">{t("profileMyDesignPrice")} <span className="text-red-600">*</span></Label>
                          <Input
                            id="design-price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={t("profileMyDesignPricePlaceholder")}
                            value={designFormData.price}
                            onChange={(e) => setDesignFormData({ ...designFormData, price: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="design-file">{t("profileMyDesignUpload")} <span className="text-red-600">*</span></Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              id="design-file"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="design-file" className="cursor-pointer">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600">
                                {selectedFile ? selectedFile.name : t("profileMyDesignUploadPlaceholder")}
                              </p>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 justify-end items-end">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setDesignFormData(INITIAL_DESIGN_FORM_STATE)}
                          >
                            {t("FormClearBtn")}
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={uploadDesignMutation.isPending || !selectedFile}
                          >
                            {uploadDesignMutation.isPending ? t("profileMyDesignSubmitingBtn") : t("profileMyDesignSubmitBtn")}
                          </Button>
                        
                        </div>
                      
                      </form>

                    </CardContent>
                  </Card>

                  {/* My Designs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("profileMyDesignTotalCount")} ({designs.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {designs.length === 0 ? (
                        <div className="text-center py-8">
                          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profileMyDesignNoRecordTitle")}</h3>
                          <p className="text-gray-600">{t("profileMyDesignNoRecordDesc")}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                          {designs.map((design: any) => (
                            <div key={design.id} className="relative border rounded-lg overflow-hidden">
                              <img
                                src={design.imageUrl}
                                alt={design.title}
                                className="w-full h-32 object-cover"
                              />
                             
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex justify-start">
                                  <Button 
                                    size="sm"
                                    className="bg-red-500 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteDesignMutation.mutate(design.id);
                                    }}
                                  >
                                  <Trash2 className="h-4 w-4 items-center" />  
                                  </Button>
                                  
                              </div>
                              <div className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 ${ design.isPublic === true ? ('bg-green-600') : design.isRejected === true ? ('bg-red-600' ) : ( 'bg-blue-600' )} text-white px-6 py-1 font-semibold shadow-lg right-5 top-[16%]`}>
                                    {
                                      design.isPublic === true ? (
                                        'Approved'
                                      ): design.isRejected === true ? (
                                        'Rejected'
                                      ) : (
                                        'Pending'
                                      )
                                    }                                
                              </div>
                              <div className="p-3 flex justify-between">
                                <h4 className="font-medium">{design.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {design.downloadCount} {t("profileMyDesignDownloadCount")}
                                </p>   
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>  

              <TabsContent value="statistics" className="w-full">
                <div className="space-y-6">
                  {/* Upload New Design */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("profileMyStatisticsMainTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent>

                      <div className="space-y-6">
                        {/* Stats cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                              <CardTitle className="text-sm font-medium text-blue-800">{t("Total Downloads")}</CardTitle>
                              <Package className="h-5 w-5 text-blue-800" />
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="text-3xl font-bold text-blue-700">{stats?.totalDownloads || 0}</div>
                              {/* <p className="text-xs text-gray-600 mt-1">
                                +{stats?.newDownloadsThisWeek || 0} this week
                              </p> */}
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                              <CardTitle className="text-sm font-medium text-green-800">{t("Total Earnings")}</CardTitle>
                              <CirclePoundSterling className="h-5 w-5 text-green-800" />
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="text-3xl font-bold text-green-700">€{stats?.totalEarnings || 0}</div>
                              {/* <p className="text-xs text-gray-600 mt-1">
                                {stats?.newtotalEarningThisWeek || 0} this week
                              </p> */}
                            </CardContent>
                          </Card>

                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  
                </div>
              </TabsContent>  

            </>
          
          )} 

      </Tabs>
    </div>
  );
}
