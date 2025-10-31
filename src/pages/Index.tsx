import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Search, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, hsl(200 85% 45% / 0.15), transparent), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 container px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Boomerang
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-foreground">
                Lost in the Ocean, Found at the Sea
              </p>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Reuniting people with their belongings across schools, offices, and public spaces. Your lost item could be just a search away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/report-lost")}
                className="text-lg px-8 py-6"
              >
                <FileText className="mr-2 h-5 w-5" />
                Report Lost Item
              </Button>
              <Button 
                size="lg" 
                variant="action"
                onClick={() => navigate("/report-found")}
                className="text-lg px-8 py-6"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Report Found Item
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/browse")}
                className="text-lg px-8 py-6 bg-background/80 backdrop-blur"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Items
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report</h3>
              <p className="text-muted-foreground">
                Post details about your lost or found item with photos and descriptions
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-muted-foreground">
                Browse through items filtered by category, location, and date
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-[hsl(30_85%_65%)] flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reunite</h3>
              <p className="text-muted-foreground">
                Connect with others through secure messaging to reclaim your belongings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Item?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community and help create a world where nothing stays lost
          </p>
          <Button 
            size="lg" 
            variant="hero"
            onClick={() => navigate("/browse")}
            className="text-lg px-8 py-6"
          >
            Start Searching Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Boomerang. Lost in the Ocean, Found at the Sea.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
