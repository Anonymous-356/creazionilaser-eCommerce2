import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import DesignCard from "@/components/DesignCard";

export default function TermsAndCondition() {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  console.log(artists);

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ["/api/designs", selectedArtist],
    queryFn: async () => {
      const url = selectedArtist && selectedArtist !== "all"
        ? `/api/designs?artist=${selectedArtist}`
        : "/api/designs";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch design');
      return response.json();
    },
  });

  console.log(designs);

  const filteredDesigns = designs
    .filter((design: any) => 
      design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });

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
    
    <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 py-8">
      
      {/* Content Grid */}
      
        <article className="p-6 bg-white rounded-2xl shadow-md">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Termini di Servizio &amp; Condizioni di Vendita</h1>
            <p className="mt-2 text-sm text-gray-500">Ultimo aggiornamento: 30/07/2025</p>
          </header>

          <section className="prose prose-lg">
            <h2 className="text-xl font-semibold mt-6">1. Titolare del sito</h2>
            <p>Il sito <a href="https://www.creazionilaser.com" className="underline">www.creazionilaser.com</a> è gestito dalla <strong>Macrohard srl</strong>, titolare effettivo <strong>Michele Macagnino</strong>, con sede legale in Strada val San Martino 111, Torino. Contatti: <a href="mailto:info@creazionilaser.com" className="underline">info@creazionilaser.com</a>.</p>

            <h2 className="text-xl font-semibold mt-6">2. Oggetto del servizio</h2>
            <p>CreazioniLaser.com è un e‑commerce dedicato alla vendita di prodotti personalizzati e artigianali, realizzati tramite tecniche come stampa laser, DTF, vinile e incisione. La piattaforma offre inoltre uno spazio per gli artisti per pubblicare e vendere le proprie grafiche.</p>

            <h2 className="text-xl font-semibold mt-6">3. Modalità di acquisto</h2>
            <p>Gli ordini possono essere effettuati online selezionando il prodotto desiderato, personalizzandolo (se previsto) e completando il pagamento. L'acquisto si considera concluso al ricevimento della conferma d'ordine inviata via email.</p>

            <h2 className="text-xl font-semibold mt-6">4. Prezzi e pagamenti</h2>
            <p>Tutti i prezzi sono espressi in Euro e comprensivi di IVA, salvo diversa indicazione. Sono accettati pagamenti tramite carta di credito, PayPal e bonifico bancario. Le transazioni sono protette da protocolli cifrati e sicuri.</p>

            <h2 className="text-xl font-semibold mt-6">5. Tempi di produzione e spedizione</h2>
            <p>I tempi di produzione variano indicativamente da 2 a 5 giorni lavorativi a seconda del tipo di prodotto. La spedizione avviene tramite corriere espresso o standard; i tempi di consegna indicati sono da considerarsi orientativi.</p>

            <h2 className="text-xl font-semibold mt-6">6. Diritto di recesso</h2>
            <p>Ai sensi dell'art. 59 del Codice del Consumo, il diritto di recesso non si applica ai beni personalizzati. In caso di prodotto difettoso o errato, il cliente può contattarci entro 7 giorni dalla ricezione per richiedere sostituzione o rimborso.</p>

            <h2 className="text-xl font-semibold mt-6">7. Responsabilità del cliente</h2>
            <p>Il cliente garantisce di possedere i diritti necessari per l'uso delle immagini o grafiche caricate per la personalizzazione. CreazioniLaser.com non è responsabile per l'utilizzo di contenuti protetti da copyright caricati senza autorizzazione.</p>

            <h2 className="text-xl font-semibold mt-6">8. Account utente</h2>
            <p>Creando un account, l'utente si impegna a fornire dati veritieri e aggiornati. L'account è personale e non cedibile. In caso di uso improprio, ci riserviamo il diritto di sospendere o eliminare l'account.</p>

            <h2 className="text-xl font-semibold mt-6">9. Artisti e contenuti creativi</h2>
            <p>Gli artisti che vendono grafiche sulla piattaforma mantengono la proprietà intellettuale delle proprie opere. Autorizzano tuttavia CreazioniLaser.com all'uso delle immagini per finalità promozionali e commerciali nei limiti stabiliti dalla collaborazione.</p>

            <h2 className="text-xl font-semibold mt-6">10. Proprietà intellettuale</h2>
            <p>Tutti i contenuti del sito (testi, immagini, loghi, design, software) sono di proprietà di CreazioniLaser.com o concessi in licenza. È vietata la riproduzione o l'utilizzo non autorizzato.</p>

            <h2 className="text-xl font-semibold mt-6">11. Legge applicabile e foro competente</h2>
            <p>I presenti termini sono regolati dalla legge italiana. Per eventuali controversie, sarà competente il foro del luogo di residenza o domicilio del consumatore, se ubicato nel territorio dello Stato.</p>

            <h2 className="text-xl font-semibold mt-6">12. Modifiche ai termini</h2>
            <p>Ci riserviamo il diritto di aggiornare o modificare i presenti Termini e Condizioni in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina e avranno effetto dalla data di pubblicazione.</p>

            <footer className="mt-8 border-t pt-4 text-sm text-gray-500">
              <p>Per qualsiasi informazione contattaci tramite la <a href="/contatti" className="underline">pagina Contatti</a> o scrivi a <a href="mailto:info@creazionilaser.com" className="underline">info@creazionilaser.com</a>.</p>
            </footer>
          </section>
        </article>

    </div>
  );
}
