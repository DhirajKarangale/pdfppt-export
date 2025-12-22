import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Code, Menu, X, Github, FileText, Monitor } from "lucide-react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Demo", path: "/demo", icon: Monitor },
    { label: "Documentation", path: "/documentation", icon: FileText },
  ];

  const isOnDemoRoute = location.pathname === "/demo";
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Project Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <Code className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                PDF & PPT Export
              </h1>
              <p className="text-xs text-slate-600">React Dashboard Export</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <a
              href="https://github.com/DhirajKarangale/pdfppt-export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>

            {/* Export controls moved to Demo page - navbar remains navigation-only */}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-slate-200 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <a
              href="https://github.com/DhirajKarangale/pdfppt-export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>

            {/* Export controls moved to Demo page - navbar remains navigation-only */}
          </nav>
        )}
      </div>
    </header>
  );
}


export default memo(Navbar);