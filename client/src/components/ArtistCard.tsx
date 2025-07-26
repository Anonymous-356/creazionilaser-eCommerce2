import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Instagram, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

interface ArtistCardProps {
  artist: {
    id: number;
    userId: string;
    bio?: string;
    specialty?: string;
    socialLinks?: any;
    isVerified: boolean;
    commissionRate: string;
    createdAt: string;
  };
}

export default function ArtistCard({ artist }: ArtistCardProps) {

  const { t, i18n } = useTranslation();

  // Fetch user details for the artist
  const { data: userDetails } = useQuery({
    queryKey: [`/api/users/${artist.userId}`],
    enabled: false, // We'll use mock data since we don't have a user details endpoint
  });

  // Fetch designs by this artist
  const { data: designs = [] } = useQuery({
    queryKey: ["/api/designs", artist.artistId],
    queryFn: async () => {
      const response = await fetch(`/api/designs?artist=${artist.artistId}`);
      if (!response.ok) throw new Error('Failed to fetch designs');
      return response.json();
    },
  });

  // Mock user data (in a real app, this would come from the user details API) //designs?[0].imageUrl != null

  //const mockCover = (designs as any)?.imageUrl != null ? (designs as any)?.imageUrl : `https://images.unsplash.com/photo-${1500000000000 + artist.id}?w=400&h=250&fit=crop`;
  const mockAvatar = artist?.imageUrl != null ? artist?.imageUrl : `https://images.unsplash.com/photo-${1500000000000 + artist.id}?w=64&h=64&fit=crop&crop=face`;
  const mockRating = (4.5 + (artist.id % 10) * 0.05).toFixed(1);
  const mockReviews = 50 + (artist.id * 17) % 200;

  const socialLinks = artist.socialLinks || {};

  return (
    <Card className="group overflow-hidden card-hover">
      <CardContent className="p-0">
        {/* Header Image */}
        <div className="relative h-48">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
            <img 
              src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop"
              alt="Artist workspace" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <img 
                src= {artist?.imageUrl}
                alt={artist?.firstName+''+artist?.lastName}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>
          {artist.isVerified ? (
            <Badge className="absolute top-4 right-4 bg-green-500">
              {t("Verified")}
            </Badge>
          )
          :
          (
             <Badge className="absolute top-4 right-4 bg-red-500">
              {t("Unverified")}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                {artist?.firstName+' '+artist?.lastName}
              </h3>
              <p className="text-gray-600 text-sm">
                {artist.specialty || "Digital Artist"}
              </p>
            </div>

          {artist?.biography && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {artist?.biography}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">{mockRating}</span>
              </div>
              <span className="text-sm text-gray-500">({mockReviews} {t("featuredArtistCardReviewTxt")})</span>
            </div>
            <span className="text-sm text-gray-500">
              {designs.length} {t("featuredArtistCardDesignTxt")}{designs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Social Links */}
          {(socialLinks.website || socialLinks.instagram) && (
            <div className="flex items-center space-x-2 mb-4">
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button 
            target="_blank"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              // Navigate to artist profile or designs
              window.location.href = `/portfolio/?artist=${artist.artistId}`;
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("featuredArtistCardCTA")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
