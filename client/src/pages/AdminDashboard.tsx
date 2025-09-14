import { useState } from "react";
import '../i18n/i18n'; // initialize i18n
import { useTranslation } from 'react-i18next';

import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Package, 
  ShoppingCart,
  GalleryThumbnails, 
  MessageSquareQuote,  
  Settings, 
  BarChart3, 
  Phone,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Ban,
  Eye,
  EyeOff,
  Upload,
  CheckCheck,
  Languages,
  FolderHeart
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {

  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ isLoading,setLocation] = useLocation();

  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };  

  // Fetch admin data
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: artists } = useQuery({
    queryKey: ["/api/admin/artists"],
  });

  const { data: designs } = useQuery({
    queryKey: ["/api/admin/designs"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  const { data: subcategories } = useQuery({
    queryKey: ["/api/admin/subcategories"],
  });

  const { data: quotes } = useQuery({
    queryKey: ["/api/admin/quotes"],
  });

  const { data: enquiries } = useQuery({
    queryKey: ["/api/admin/enquiries"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/admin/orders"],
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

  const sidebarItems = [
    { id: "overview", label: t("Overview"), icon: BarChart3 },
    { id: "users", label: t("Users"),icon: Users,listItems:[
        {id: "users", label: t("Users"),icon: Users},
        {id: "artists", label: t("Artists"),icon: Users} 
      ]
    },
    { id: "designs", label: t("Designs"), icon: FolderHeart},
    { id: "categories", label: t("Categories"), icon: Package},
    { id: "products", label: t("Products"), icon: Package },
    { id: "orders", label: t("Orders"), icon: ShoppingCart },
    { id: "enquiries", label: t("Enquiries"), icon: Package ,listItems:[
        {id : "enquiries", label : t("Enquiries"),icon: Phone },
        {id : "quotes", label : t("Custom Quotes"),icon: MessageSquareQuote }
      ] 
    },
    { id: "settings", label: t("Settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold text-white">{t("Admin Panel")}</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-blue-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                   (item.id !== 'users' && item.id !== 'categories' && item.id !== 'enquiries') ? setActiveTab(item.id) : '';
                  (item.id !== 'users' && item.id !== 'categories' && item.id !== 'enquiries') ? setSidebarOpen(false) : '';
                }}
                className={`w-full flex items-center px-6 ${item.id !== 'users' && item.id !== 'categories' && item.id !== 'enquiries' ? 'py-4' : 'py-1'} text-left transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >

                 
                { (item.id === 'users' || item.id === 'categories' || item.id === 'enquiries') ? (

                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full justify-start flex px-1 py-4 text-left transition-all duration-200" variant="ghost" size="md">
                          <Icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                          {item.label}
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    
                    {item.listItems?.map((litems) => (
                      
                      

                      <DropdownMenuItem asChild>

                            <button
                                key={litems.id}
                                onClick={() => {
                                  setActiveTab(litems.id);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 ${
                                  activeTab === litems.id 
                                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium' 
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <Icon className={`h-5 w-5 mr-3 ${activeTab === litems.id ? 'text-blue-600' : 'text-gray-500'}`} />
                                {litems.label}
                            </button>

                      </DropdownMenuItem>
                        
                    ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                )
                :
                (

                  <>
                   <Icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    {item.label}
                  </>

                )}
              </button>
            );

            

          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </p>
                <p className="text-xs text-gray-600 truncate">{(user as any)?.email}</p>
              </div>
            </div>
            <Badge variant="default" className="mt-3 w-full justify-center bg-blue-600 hover:bg-blue-700">
              {t("Administrator")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-4 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{t("Welcome back!")}</p>
              <p className="text-xs text-gray-600">{(user as any)?.firstName} {(user as any)?.lastName}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              {t("Logout")}
            </Button>
            <div className="">
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
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {activeTab === "overview" && <OverviewTab stats={stats} />}
          {activeTab === "users" && <UsersTab users={users} />}
          {activeTab === "artists" && <ArtistsTab artists={artists} />}
          {activeTab === "deisgns" && <DesingsTab designs={designs} />}
          {activeTab === "categories" && <CategoriesTab categories={categories} />}
          {activeTab === "subcategories" && <SubCategoriesTab subcategories={subcategories} categories={categories}/>}
          {activeTab === "products" && <ProductsTab products={products} categories={categories} subcategories={subcategories} />}
          {activeTab === "quotes" && <QuotesTab quotes={quotes} />}
          {activeTab === "enquiries" && <EnquiriesTab enquiries={enquiries} />}
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats?: any }) {

  const { t, i18n } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-blue-800">{t("Total Users")}</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-700">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              +{stats?.newUsersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-800">{t("Products")}</CardTitle>
            <Package className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-700">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.totalCategories || 0} categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-purple-800">{t("Total Orders")}</CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-purple-700">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              ${stats?.totalRevenue || 0} revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-orange-800">{t("Artist Designs")}</CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-orange-700">{stats?.totalDesigns || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              From {stats?.totalArtists || 0} artists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Recent Activity")}</CardTitle>
          <CardDescription>{t("Latest platform activities and updates")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">{t("New user registered")}</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">{t("Product added to catalog")}</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">{t("New artist design uploaded")}</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab({ users }: { users?: any[] }) {

  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { t, i18n } = useTranslation();
  
  const userRoles = [
    {id : 'customer',name : t('Customer')},
    {id : 'artist',name : t('Artist')}
  ]

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateOpen(false);
      toast({ title: t("User created successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to create user"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      return await apiRequest(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({ title: t("user updated successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: "failed to update user",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}/1`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("user block successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("failed to block user"),
        description: error.message,
        variant: "destructive"
      });
    },
  });


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("User Management")}</CardTitle>
          <CardDescription>{t("Manage platform users and their permissions")}</CardDescription>
        </div>

         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("Add User")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogDescription>{t("Adding a new user to your platform!")}</DialogDescription>
            </DialogHeader>
            <UserForm 
              userRoles={userRoles}
              onSubmit={(data) => createUserMutation.mutate(data)}
              isLoading={createUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit User")}</DialogTitle>
              <DialogDescription>{t("Update User information")}</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <UserForm 
                user={editingUser}
                onSubmit={(data) => updateUserMutation.mutate({ id: editingUser.id, ...data })}
                isLoading={updateUserMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Type")}</TableHead>
                <TableHead>{t("Joined")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.userType === 'admin' ? 'default' : 'secondary'}>
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button> */}
                      <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingUser(user)}
                      >
                      <Edit className="h-4 w-4"/>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to block "${user.firstName}"? This action cannot be undone.`)) {
                            blockUserMutation.mutate(user.id);
                          }
                        }}
                        disabled={blockUserMutation.isPending}
                      >
                      <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserForm({ userRoles, user, onSubmit, isLoading }: { 
  userRoles?: any[]; 
  user?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;

})  {

  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    fname: user?.firstName || "",
    lname: user?.lastName || "",
    email: user?.email || "",
    currentEmail : user?.email || "",
    password : user?.password || "",
    confirmPassword : user?.confirmPassword || "",
  });

 const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault();
    
    if(!user){
      if (!formData.fname || !formData.lname || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: t("Missing fields"),
          description: t("Please fill in all fields."),
          variant: "destructive",
        });
        return;
      }
    }    
    else{
      if (!formData.fname || !formData.lname || !formData.email) {
          toast({
            title: t("Missing fields"),
            description: t("Please fill in all fields."),
            variant: "destructive",
          });
          return;
        }
    }

    if (!user && formData.password.length < 6) {
      toast({
        title: t("Password too short"),
        description: t("Password must be at least 6 characters long."),
        variant: "destructive",
      });
      return;
    }

    if (!user && formData.password !== formData.confirmPassword) {
      toast({
        title: t("Passwords don't match"),
        description: t("Please make sure your passwords match."),
        variant: "destructive",
      });
      return;
    }

    onSubmit({  ...formData,
    });

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fname">{t("First Name")}</Label>
        <Input
          id="fname"
          value={formData.fname}
          onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
          placeholder="e.g.,Firstname"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="lname">{t("Last Name")}</Label>
        <Input
          id="lname"
          value={formData.lname}
          onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
          placeholder="e.g.,Lastname"
        />
      </div>

      <div>
        <Input
          type="hidden"
          value={formData.currentEmail}
          onChange={(e) => setFormData({ ...formData, currentEmail: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">{t("Email")}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="e.g.,Google@gmail.com"
          required
        />
      </div>
      { (!user) && (

          <>
            <div>
              <Label htmlFor="password">{t("Password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
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
            <div>
              <Label htmlFor="cPassword">{t("Confirm Password")}</Label>
              <div className="relative">
                <Input
                  id="cPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
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
          </>
      
      )}

      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (user ? "Updating..." : "Creating...") : (user ? "Update User" : "Create User")}
      </Button>
    </form>
  );
}

function ArtistsTab({ artists }: { artists?: any[] }) {

  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const { t, i18n } = useTranslation();
 
  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, ...artistData }: any) => {
      
     return await apiRequest(`/api/admin/artists/${id}/${'profile'}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artistData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/artists"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/artists"] });
      setEditingArtist(null);
      toast({ title: "Artist updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to update Artist"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const rejectedArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      return await apiRequest(`/api/admin/artists/${artistId}/${'reject'}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({isRejected : true}),    
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/artists"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/artists"] });
      toast({ title: t("Artist rejected successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to reject artist"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const verificaionArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      const isVerified = true;
      return await apiRequest(`/api/admin/artists/${artistId}/${'verify'}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({isVerified : true}),      
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/artists"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/artists"] });
      toast({ title: "Artist verified successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to verify artist"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("Artist Management")}</CardTitle>
          <CardDescription>{t("Manage platform Artist and their permissions")}</CardDescription>
        </div>

        <Dialog open={!!editingArtist} onOpenChange={() => setEditingArtist(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Artist")}</DialogTitle>
              <DialogDescription>{t("Update Artist information")}</DialogDescription>
            </DialogHeader>
            {editingArtist && (
              <ArtistForm 
                artist={editingArtist}
                onSubmit={(data) => updateArtistMutation.mutate({ id: editingArtist.id, ...data })}
                isLoading={updateArtistMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Speciality")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists?.map((artist: any) => (
                
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">{artist.firstName} {artist.lastName}</TableCell>
                  <TableCell>{artist.email}</TableCell>
                  <TableCell>
                    {artist.specialty}
                  </TableCell>
                  <TableCell>
                    {artist.isVerified}
                    { 
                      artist.isVerified === true ? (
                        <Badge className="lg-rounded" variant="default" size="sm">{t("Verified")}</Badge>
                      )
                      : artist.isVerified === false && (
                        <Badge className="lg-rounded" variant="destructive" size="sm">{t("Pending")} </Badge>
                      )
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArtist(artist)}
                      >
                      <Edit className="h-4 w-4"/>
                      </Button>
                      {artist.isVerified !== true && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to reject "${artist.firstName}" artist account? This action cannot be undone.`)) {
                            rejectedArtistMutation.mutate(artist.id);
                          }
                        }}
                        disabled={rejectedArtistMutation.isPending}
                      >
                      <Ban className="h-4 w-4"/>
                      </Button>
                      )}
                      {artist.isVerified !== true && (
                      <Button variant="default" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to verify "${artist.firstName}" artist account? This action cannot be undone.`)) {
                            verificaionArtistMutation.mutate(artist.id);
                          }
                        }}
                        disabled={verificaionArtistMutation.isPending}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ArtistForm({ artist, onSubmit, isLoading }: { 
  artist?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
})  {
  const [formData, setFormData] = useState({
    fname: artist?.firstName,
    lname: artist?.lastName || "",
    email: artist?.email,
    specialty: artist?.specialty,
    bio: artist?.biography,
    userType: artist?.userType,
  });

  const { t, i18n } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fname">{t("Full name")}</Label>
        <Input
          id="fname"
          type="text"
          value={formData.fname+' '+formData.lname}
          disabled
          onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="usertype">{t("User Type")}</Label>
        <Input
          id="userType"
          type="text"
          disabled
          value={formData.userType}
          onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
          required
        />
      </div>

       <div>
        <Label htmlFor="speciality">{t("Speciality")}</Label>
        <Textarea
          id="speciality"
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          required
        />
      </div>

       <div>
        <Label htmlFor="biography">{t("Biography")}</Label>
        <Textarea
          id="biography"
          value={formData.biography}
          onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (artist ? t("Updating...") : t("Creating...") ) : (artist ? t("Update Artist") : t("Create Artist") )}
      </Button>
    </form>
  );
}

function ProductsTab({ products, categories,subcategories }: { products?: any[]; categories?: any[];subcategories?: any[] }) {
  
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { t, i18n } = useTranslation();


  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/products"] });
      setIsCreateOpen(false);
      toast({ title: t("product created successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create product",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      return await apiRequest(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/products"] });
      setEditingProduct(null);
      toast({ title: "product updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update product",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: t("product deleted successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("Product Management")}</CardTitle>
          <CardDescription>{t("Manage your product catalog and inventory")}</CardDescription>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Product")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Create New Product")}</DialogTitle>
              <DialogDescription>{t("Add a new product to your catalog")}</DialogDescription>
            </DialogHeader>
            <ProductForm 
              categories={categories} 
              subcategories={subcategories}
              onSubmit={(data) => createProductMutation.mutate(data)}
              isLoading={createProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Product")}</DialogTitle>
              <DialogDescription>{t("Update product information")}</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <ProductForm 
                categories={categories} 
                subcategories={subcategories}
                product={editingProduct}
                onSubmit={(data) => updateProductMutation.mutate({ id: editingProduct.id, ...data })}
                isLoading={updateProductMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("Price")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>${product.basePrice}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!products || products.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No products yet. Add your first product to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductForm({ categories,subcategories, product, onSubmit, isLoading }: { 
  categories?: any[]; 
  subcategories?: any[]; 
  product?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
})  {
 

  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: product?.categoryId?.toString() || "",
    subcategoryId: product?.subcategoryId?.toString() || "",
    basePrice: product?.basePrice || "",
    imageUrl: product?.imageUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      categoryId: parseInt(formData.categoryId),
      subcategoryId: parseInt(formData.subcategoryId),
      basePrice: formData.basePrice,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("Product Name")}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("Description")}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Description"
        />
      </div>

      <div>
        <Label htmlFor="category">{t("Category")}</Label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subcategory">{t("Sub Category")}</Label>
        <Select value={formData.subcategoryId} onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories?.map((subcategory: any) => (
              <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="basePrice">{t("Price (€)")}</Label>
        <Input
          id="basePrice"
          type="number"
          step="0.01"
          value={formData.basePrice}
          onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          placeholder="e.g., 0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">{t("Image URL")}</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="e.g., Image Url"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (product ? t("updating") : t("creating")) : (product ? t("Update Product") : "Create Product")}
      </Button>
    </form>
  );
}

function DesingsTab({ designs }: { designs?: any[] }) {

  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const { t, i18n } = useTranslation();
 
  const rejectedDesignMutation = useMutation({
    mutationFn: async (artistId: number) => {
      return await apiRequest(`/api/admin/designs/${artistId}/${'reject'}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({isRejected : true}),    
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/designs"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/designs"] });
      toast({ title: t("Design rejected successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to reject design"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const approvalDesignMutation = useMutation({
    mutationFn: async (artistId: number) => {
      const isVerified = true;
      return await apiRequest(`/api/admin/designs/${artistId}/${'approve'}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({isVerified : true}),      
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/designs"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/designs"] });
      toast({ title: "Designs approved successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: t("Failed to approve design"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("Artist Management")}</CardTitle>
          <CardDescription>{t("Manage platform Artist and their permissions")}</CardDescription>
        </div>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Speciality")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deisgns?.map((artist: any) => (
                
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">{artist.firstName} {artist.lastName}</TableCell>
                  <TableCell>{artist.email}</TableCell>
                  <TableCell>
                    {artist.specialty}
                  </TableCell>
                  <TableCell>
                    {artist.isVerified}
                    { 
                      artist.isVerified === true ? (
                        <Badge className="lg-rounded" variant="default" size="sm">{t("Verified")}</Badge>
                      )
                      : artist.isVerified === false && (
                        <Badge className="lg-rounded" variant="destructive" size="sm">{t("Pending")} </Badge>
                      )
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArtist(artist)}
                      >
                      <Edit className="h-4 w-4"/>
                      </Button>
                      {artist.isVerified !== true && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to reject "${artist.firstName}" artist account? This action cannot be undone.`)) {
                            rejectedDesignMutation.mutate(artist.id);
                          }
                        }}
                        disabled={rejectedDesignMutation.isPending}
                      >
                      <Ban className="h-4 w-4"/>
                      </Button>
                      )}
                      {artist.isVerified !== true && (
                      <Button variant="default" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to verify "${artist.firstName}" artist account? This action cannot be undone.`)) {
                            approvalDesignMutation.mutate(artist.id);
                          }
                        }}
                        disabled={approvalDesignMutation.isPending}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function QuotesTab({ quotes }: { quotes?: any[] }) {

  const { t, i18n } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("View and manage custom quotes")}</CardDescription>
      </CardHeader>
      <CardContent> 
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Title")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes?.length ? quotes.map((quote: any) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.title}</TableCell>
                  <TableCell>{quote.email}</TableCell>
                  <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No quotes yet. Quotes will appear here when user submit a custom quote.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EnquiriesTab({ enquiries }: { enquiries?: any[] }) {

  const { t, i18n } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardDescription className="">{t("View and manage customer enquiries")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Title")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries?.length ? enquiries.map((enquiry: any) => (
                <TableRow key={enquiry.id}>
                  <TableCell>{enquiry.title}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>{new Date(enquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No enquiries yet. enquiries will appear here when user submit their first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersTab({ orders }: { orders?: any[] }) {

  const { t, i18n } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Order Management")}</CardTitle>
        <CardDescription>{t("View and manage customer orders")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Order")} #</TableHead>
                <TableHead>{t("Customer")}</TableHead>
                <TableHead>{t("Total")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.length ? orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>${order.totalAmount}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No orders yet. Orders will appear here when customers start purchasing.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriesTab({ categories }: { categories?: any[] }) {
  
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { t, i18n } = useTranslation();

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/categories"] });
      setIsCreateOpen(false);
      toast({ title: t("categorycreationSuccessMessage") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("categorycreationFailureMessage"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      return await apiRequest(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/categories"] });
      setEditingCategory(null);
      toast({ title: t("categoryupdateSuccessMessage") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("categoryupdateFailureMessage"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: t("categorydeleteSuccessMessage") });
    },
    onError: (error: any) => {
      let errorMessage = error.message;
      
      // Check if it's a constraint violation
      if (error.message.includes("product(s) are using this category")) {
        errorMessage = error.message;
      } else if (error.message.includes("violates foreign key constraint")) {
        errorMessage = "Cannot delete category. Products are still using this category.";
      }
      
      toast({ 
        title: t("categorydeleteFailureMessage"),
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("Category Management")}</CardTitle>
          <CardDescription>{t("Organize your products with categories")}</CardDescription>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Category")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Create New Category")}</DialogTitle>
              <DialogDescription>{t("Add a new product category")}</DialogDescription>
            </DialogHeader>
            <CategoryForm 

              onSubmit={(data) => createCategoryMutation.mutate(data)}
              isLoading={createCategoryMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Category")}</DialogTitle>
              <DialogDescription>{t("Edit existing product category")}</DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm 
                category={editingCategory}
                onSubmit={(data) => updateCategoryMutation.mutate({id : editingCategory.id , ...data})}
                isLoading={updateCategoryMutation.isPending}
              />
            )}
            
          </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Description")}</TableHead>
                <TableHead>{t("Slug")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow> 
            </TableHeader>
            <TableBody>
              {categories?.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || 'No description'}</TableCell>
                  <TableCell className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('categorydeleleConfirmMessage'))) {
                            deleteCategoryMutation.mutate(category.id);
                          }
                        }}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!categories || categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No categories yet. Create your first category to organize products.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryForm({ category, onSubmit, isLoading }: { 
  category?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {

  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    slug: category?.slug || "",
    imageUrl: category?.imageUrl || "",
    sortOrder: category?.sortOrder || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ 
      ...formData, 
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("Category Name")}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="e.g., Custom T-Shirts"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("Description")}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category"
        />
      </div>

      <div>
        <Label htmlFor="slug">{t("URL Slug")}</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="auto-generated from name"
        />
        <p className="text-xs text-gray-500 mt-1">Used in URLs, auto-generated if left empty</p>
      </div>
       <div>
        <Label htmlFor="imageUrl">{t("Image Url")}</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="e.g., Image Url"
        />
      </div>
       <div>
        <Label htmlFor="sortOrder">{t("Sort Order (Optional)")}</Label>
        <Input
          id="sortOrder"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
          placeholder="e.g., Sort Order"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (category ? t("updating") : t("creating")) : (category ? t("Update Category") : t("Create Category") )}
      </Button>
    </form>
  );
}

function SubCategoriesTab({ subcategories,categories }: { subcategories?: any[];categories?: any[] }) {

  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const { t, i18n } = useTranslation();

  const createSubCategoryMutation = useMutation({
    mutationFn: async (subcategoryData: any) => {
      return await apiRequest("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subcategoryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/subcategories"] });
      setIsCreateOpen(false);
      toast({ title: t("subCategory created successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("failed to create subcategory"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: async ({ id, ...subcategoryData }: any) => {
      return await apiRequest(`/api/admin/subcategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subcategoryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/subcategories"] });
      setEditingSubCategory(null);
      toast({ title: t("subCategory updated successfully") });
    },
    onError: (error: any) => {
      toast({ 
        title: t("failed to update subcategory"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (subcategoryId: number) => {
      return await apiRequest(`/api/admin/subcategories/${subcategoryId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/subcategories"] });
      toast({ title: t("sub Category deleted successfully") });
    },
    onError: (error: any) => {
      let errorMessage = error.message;
      
      // Check if it's a constraint violation
      if (error.message.includes("product(s) are using this subcategory")) {
        errorMessage = error.message;
      } else if (error.message.includes("violates foreign key constraint")) {
        errorMessage = "Cannot delete category. Products are still using this subcategory.";
      }
      
      toast({ 
        title: t("cannot Delete subCategory"),
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("Sub Category Management")}</CardTitle>
          <CardDescription>{t("Organize your products with subcategories")}</CardDescription>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Sub Category")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Create New Sub Category")}</DialogTitle>
              <DialogDescription>{t("Add a new product subcategory")}</DialogDescription>
            </DialogHeader>
            <SubCategoryForm 
              categories ={categories}
              onSubmit={(data) => createSubCategoryMutation.mutate(data)}
              isLoading={createSubCategoryMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingSubCategory} onOpenChange={() => setEditingSubCategory(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit subCategory")}</DialogTitle>
              <DialogDescription>{t("Edit existing product subcategory")}</DialogDescription>
            </DialogHeader>
            {editingSubCategory && (
              <SubCategoryForm 
                categories={categories}
                subcategory={editingSubCategory}
                onSubmit={(data) => updateSubCategoryMutation.mutate({id : editingSubCategory.id , ...data})}
                isLoading={updateSubCategoryMutation.isPending}
              />
            )}
            
          </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Description")}</TableHead>
                <TableHead>{t("Slug")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow> 
            </TableHeader>
            <TableBody>
              {subcategories?.map((subcategory: any) => (
                <TableRow key={subcategory.id}>
                  <TableCell className="font-medium">{subcategory.name}</TableCell>
                  <TableCell>{subcategory.description || 'No description'}</TableCell>
                  <TableCell className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{subcategory.slug}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSubCategory(subcategory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('subcategorydeleleConfirmMessage'))) {
                            deleteSubCategoryMutation.mutate(subcategory.id);
                          }
                        }}
                        disabled={deleteSubCategoryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!subcategories || subcategories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No subcategories yet. Create your first subcategory to organize products.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SubCategoryForm({ categories,subcategory, onSubmit, isLoading }: { 
  categories?:any;
  subcategory?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {

  const [formData, setFormData] = useState({
    categoryId: subcategory?.categoryId?.toString() || "",
    name: subcategory?.name || "",
    description: subcategory?.description || "",
    slug: subcategory?.slug || "",
    imageUrl: subcategory?.imageUrl || "",
    sortOrder: subcategory?.sortOrder || "",
  });

  const { t, i18n } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      categoryId: parseInt(formData.categoryId),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ 
      ...formData, 
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("Subcategory Name")}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="e.g., Custom T-Shirts"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("Description")}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category"
        />
      </div>

      <div>
        <Label htmlFor="slug">{t("URL Slug")}</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="auto-generated from name"
        />
        <p className="text-xs text-gray-500 mt-1">Used in URLs, auto-generated if left empty</p>
      </div>

      <div>
        <Label htmlFor="category">{t("Category")}</Label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

       <div>
        <Label htmlFor="imageUrl">{t("Image Url")}</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="e.g., Image Url"
        />
      </div>
       <div>
        <Label htmlFor="sortOrder">{t("Sort Order (Optional)")}</Label>
        <Input
          id="sortOrder"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
          placeholder="e.g., Sort Order"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (subcategory ? t("updating") : t("creating") ) : (subcategory ? t("Update Sub Category") : t("Create Sub Category") )}
      </Button>
    </form>
  );
}

function SettingsTab() {

  const { toast } = useToast();
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const { t, i18n } = useTranslation();

  const createSaveSettingsMutation = useMutation({
        
        mutationFn: async (formData: any) => {
         
        const response = await fetch("/api/admin/settings", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to save platform Settings.");
          return response.json();
        },
      
        onSuccess: () => {
          toast({
            title: "Success",
            description: t("Save settings successfully!"),
          });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
         
        },

        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },

    });
  
    const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedLogoFile) return;
        const formData = new FormData(e.currentTarget);
        formData.append("logo", selectedLogoFile);
        createSaveSettingsMutation.mutate(formData);
    };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>{t("Branding")}</CardTitle>
          <CardDescription>{t("Mange your branding from here")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
              <div>

                  <Label htmlFor="favicon">{t("Favicon Icon")}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      id="favicon"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setSelectedFaviconFile(e.target.files?.[0] || null)}
                      required
                    />
                    <label htmlFor="favicon" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        {selectedFaviconFile ? selectedFaviconFile.name : "Click to upload design"}
                      </p>
                    </label>
                  </div>

              </div>
              
              <div>
                <Label htmlFor="logo">{t("Logo Icon")}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="logo"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setSelectedLogoFile(e.target.files?.[0] || null)}
                    required
                  />
                  <label htmlFor="logo" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {selectedLogoFile ? selectedLogoFile.name : "Click to upload Logo"}
                    </p>
                  </label>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-1">
              <div>
                <h1 className="text-2xl"><b>{t("Platform Settings")}</b></h1>
                <span className="text-gray-400">{t("This is here major settings are updated")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <Label htmlFor="commission">{t("Artist Commission")} (%)</Label>
                <Input 
                  id="commission" 
                  name="commission" 
                  type="number" 
                  defaultValue="30" 
                  />
              </div>
              
              <div>
                <Label htmlFor="tax">{t("Tax Rate")} (%)</Label>
                <Input 
                  id="tax" 
                  name="tax" 
                  type="number" 
                  step="0.01" 
                  defaultValue="0" 
                />
              </div>

              <div>
                <Label htmlFor="shipping">{t("Default Shipping")} ($)</Label>
                <Input 
                  id="shipping" 
                  name="shipping" 
                  type="number" 
                  step="0.01" 
                  defaultValue="5.99" 
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select id="currency" name="currency" defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={createSaveSettingsMutation.isPending}
              >
              {createSaveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
           </form>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t("Notification Settings")}</CardTitle>
          <CardDescription>{t("Manage your notification preferences")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("New Orders")}</p>
              <p className="text-sm text-gray-500">{t("Get notified when new orders are placed")}</p>
            </div>
            <Button variant="outline" size="sm">{t("Enable")}</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("New Users")}</p>
              <p className="text-sm text-gray-500">{t("Get notified when users register")}</p>
            </div>
            <Button variant="outline" size="sm">{t("Enable")}</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("Artist Uploads")}</p>
              <p className="text-sm text-gray-500">{t("Get notified when artists upload designs")}</p>
            </div>
            <Button variant="outline" size="sm">{t("Enable")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}