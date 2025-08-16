import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, Star } from "lucide-react";
import ArtistCard from "@/components/ArtistCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Artists() {

  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: artist } = useQuery({
    queryKey: ["/api/artists/me"],
    enabled: isAuthenticated,
  });

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ["/api/artists"],
  });

  const filteredArtists = artists.filter((artist: any) =>
    
    artist.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("featuredArtistSectionTitle")}</h1>
        <p className="text-xl text-gray-600 mb-8">
          {t("featuredArtistSectionDesc")}
        </p>
       
      </div>

      {/* Search */}
      <div className="mb-8 flex items-center justify-between">

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("featuredArtistSectionSearchBar")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isAuthenticated && !artist && (
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setLocation("/become-an-artist")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("featuredArtistSectionBtn")}
          </Button>
        )}

      </div>

      {/* Stats */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{artists.length}</div>
              <div className="text-gray-600">{t("featuredArtistSectionInfoCommunity")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">1.2K+</div>
              <div className="text-gray-600">{t("featuredArtistSectionInfoCollection")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">4.8</div>
              <div className="text-gray-600 flex items-center justify-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                {t("featuredArtistSectionInfoRating")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria
          </p>
          <Button onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger">
          {filteredArtists.map((artist: any) => (
            <ArtistCard key={artist.artistId} artist={artist} />
          ))}
        </div>
      )}

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
              className="border-white text-white text-gray-900 hover:bg-white hover:text-primary"
              onClick={() => setLocation("/become-an-artist")}
            >
              {t("ShareArtBtn")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

}
