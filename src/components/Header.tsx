import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-soft">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">
            convertingpdf
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="/"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Home
          </a>
          <a
            href="/dashboard"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Dashboard
          </a>
          <a
            href="/#tools"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Tools
          </a>
          <a
            href="/about"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            About
          </a>
          <a
            href="/contact"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Contact
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 space-y-4">
            <a
              href="/"
              className="block text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </a>

            <a
              href="/dashboard"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Dashboard
            </a>

            <a
              href="/#tools"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Tools
            </a>
            <a
              href="/about"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              About
            </a>
            <a
              href="/contact"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
