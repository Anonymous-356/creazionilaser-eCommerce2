import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

export default function Footer() {


  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link href="/">
              <img
                  src="/uploads/86c865afac2283f69423030f427ef09a"
                  alt="Logo Image"
                  className="h-64 w-auto"
              />
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              {t("footerSectionDesc")}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/CreazioniLaserCom/" 
                className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-800"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/creazionilaser_italia/" 
                className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-800"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:info@creazionilaser.com" 
                className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-800"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            { isAuthenticated && (
              <>
                <h4 className="text-lg font-semibold mb-4">{t("footerQuickLinksTitle")}</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/shop">
                      <span className="hover:text-primary transition-colors cursor-pointer">{t("footerQuickLinksShop")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/artists">
                      <span className="hover:text-primary transition-colors cursor-pointer">{t("footerQuickLinksArtists")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/designs">
                      <span className="hover:text-primary transition-colors cursor-pointer">{t("footerQuickLinksArtistG")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/create">
                      <span className="hover:text-primary transition-colors cursor-pointer">{t("footerQuickLinksCreate")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/become-an-artist">
                      <span className="hover:text-primary transition-colors cursor-pointer">{t("footerQuickLinksArtist")}</span>
                    </Link>
                  </li>
                  
                </ul>
              </>
            )}
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footerSupportTitle")}</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/faqs" className="hover:text-primary transition-colors">
                  {t("footerSupportFaqs")}
                </a>
              </li>
              <li>
                <a href="/gifts" className="hover:text-primary transition-colors">
                  {t("footerSupportIdeas")}
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  {t("footerSupportContact")}
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-primary transition-colors">
                  {t("footerSupportHowITWorks")}
                </a>
              </li>
              <li>
                <a href="/custom-quotes" className="hover:text-primary transition-colors">
                  {t("footerSupportQuotes")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {t("footerSectionCompanyRights")}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="/privacy-policy" 
              className="text-gray-400 hover:text-primary text-sm transition-colors"
            >
              {t("footerSectionPolicy")}
            </a>
            <a 
              href="/terms-&-condition" 
              className="text-gray-400 hover:text-primary text-sm transition-colors"
            >
              {t("footerSectionTermsCondt")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
