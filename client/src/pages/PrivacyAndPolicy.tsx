import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import DesignCard from "@/components/DesignCard";

export default function PrivacyAndPolicy() {

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
    
   
    <div className="container mx-auto px-4 py-8">
     <article className="p-6 bg-white rounded-2xl shadow-md">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold mb-2">Informativa sulla Privacy</h1>
          <p className="text-sm text-gray-600">Questa informativa è resa ai sensi dell’art. 13 del Regolamento UE 2016/679 (GDPR) e descrive le modalità di gestione dei dati personali degli utenti che visitano il sito <span className="font-medium">www.creazionilaser.com</span> o utilizzano i suoi servizi.</p>
        </header>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">1. Titolare del trattamento</h2>
          <p className="text-base leading-relaxed">Il Titolare del trattamento è <span className="font-medium">Macrohard srl</span>, titolare effettivo <span className="font-medium">Michele Macagnino</span>, con sede legale in <span className="font-medium">Strada val San Martino 111, Torino</span>, contattabile all’indirizzo email: <a href="mailto:info@creazionilaser.com" className="underline">info@creazionilaser.com</a></p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">2. Tipologie di dati raccolti</h2>
          <p className="text-base leading-relaxed mb-2">Nel corso della navigazione o dell’utilizzo dei nostri servizi possiamo raccogliere le seguenti categorie di dati:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>Dati anagrafici (nome, cognome, indirizzo, email, telefono)</li>
            <li>Dati di accesso (username, password)</li>
            <li>Dati di pagamento (parzialmente, tramite provider esterni come PayPal o Stripe)</li>
            <li>Dati di navigazione (IP, browser, cookies tecnici/statistici)</li>
            <li>Contenuti caricati (immagini, grafiche, testi per la personalizzazione)</li>
            <li>Dati degli artisti (bio, social link, design caricati, vendite)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">3. Finalità del trattamento</h2>
          <p className="text-base leading-relaxed mb-2">I tuoi dati saranno trattati per le seguenti finalità:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>Registrazione e gestione dell’account utente o artista</li>
            <li>Evasione degli ordini e spedizione dei prodotti</li>
            <li>Fatturazione e adempimenti fiscali</li>
            <li>Comunicazioni relative agli ordini o supporto clienti</li>
            <li>Gestione dell’area personale e salvataggio progetti</li>
            <li>Invio di newsletter e promozioni (previo consenso)</li>
            <li>Analisi statistiche e miglioramento dei servizi</li>
            <li>Prevenzione di abusi o attività fraudolente</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">4. Base giuridica</h2>
          <p className="text-base leading-relaxed">Il trattamento avviene:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>Su base contrattuale (esecuzione ordini, registrazione)</li>
            <li>Su base legale (obblighi fiscali o contabili)</li>
            <li>Su base consensuale (newsletter o marketing diretto)</li>
            <li>Su base legittimo interesse (sicurezza, miglioramento servizi)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">5. Modalità del trattamento</h2>
          <p className="text-base leading-relaxed">I dati sono trattati con strumenti elettronici e protetti da misure di sicurezza adeguate (HTTPS, autenticazione, backup). Il trattamento può essere svolto anche da collaboratori e fornitori autorizzati.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">6. Conservazione dei dati</h2>
          <p className="text-base leading-relaxed mb-2">I dati saranno conservati per il tempo strettamente necessario alle finalità sopra indicate e comunque non oltre:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>10 anni per finalità fiscali/contabili</li>
            <li>Fino alla cancellazione dell’account per dati di profilo</li>
            <li>24 mesi per fini di marketing, salvo revoca del consenso</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">7. Comunicazione e diffusione</h2>
          <p className="text-base leading-relaxed">I tuoi dati non saranno venduti a terzi. Potranno essere comunicati a:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>Corrieri e spedizionieri</li>
            <li>Fornitori di servizi IT e hosting</li>
            <li>Consulenti fiscali o legali</li>
            <li>Autorità competenti, se richiesto dalla legge</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">8. Diritti dell’interessato</h2>
          <p className="text-base leading-relaxed">Hai il diritto di:</p>
          <ul className="list-disc ml-6 text-base leading-relaxed">
            <li>Accedere, rettificare o cancellare i tuoi dati</li>
            <li>Limitare o opporti al trattamento</li>
            <li>Richiedere la portabilità dei dati</li>
            <li>Revocare il consenso in qualsiasi momento</li>
            <li>Presentare reclamo all’Autorità Garante per la protezione dei dati personali</li>
          </ul>
          <p className="text-base leading-relaxed mt-2">Puoi esercitare i tuoi diritti scrivendo a: <a href="mailto:info@creazionilaser.com" className="underline">info@creazionilaser.com</a></p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">9. Cookie</h2>
          <p className="text-base leading-relaxed">Il sito utilizza cookie tecnici e analitici. Per maggiori informazioni consulta la nostra Cookie Policy.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">10. Modifiche all’informativa</h2>
          <p className="text-base leading-relaxed">Questa informativa può essere aggiornata in qualsiasi momento. Ti invitiamo a consultarla periodicamente.</p>
          <p className="text-sm text-gray-600 mt-2">Ultimo aggiornamento: <span className="font-medium">30/07/2025</span></p>
        </section>
      </article>
    </div>
  );
}
