import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Sparkles } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';
import { haptics } from '../utils/haptics';

type FilterCategory = 'ai' | 'world' | 'business' | 'nyc' | 'costa-rica' | null;

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { setSearchTerm: setStoreSearchTerm } = useNewsStore();

  const categories: { id: FilterCategory; label: string; colorClass: string; bgClass: string; borderClass: string }[] = [
    { id: 'ai', label: 'AI', colorClass: 'text-electric-cyan', bgClass: 'bg-electric-cyan/10', borderClass: 'bg-electric-cyan' },
    { id: 'world', label: 'World', colorClass: 'text-quantum-purple', bgClass: 'bg-quantum-purple/10', borderClass: 'bg-quantum-purple' },
    { id: 'business', label: 'Business', colorClass: 'text-neon-green', bgClass: 'bg-neon-green/10', borderClass: 'bg-neon-green' },
    { id: 'nyc', label: 'NYC', colorClass: 'text-solar-orange', bgClass: 'bg-solar-orange/10', borderClass: 'bg-solar-orange' },
    { id: 'costa-rica', label: 'Costa Rica', colorClass: 'text-electric-cyan', bgClass: 'bg-electric-cyan/10', borderClass: 'bg-electric-cyan' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (categoryId: FilterCategory) => {
    haptics.light();
    setActiveCategory(categoryId);
    // For now, we'll use the search term to filter by news type
    // since the store doesn't have a setNewsType method yet
    if (categoryId) {
      setStoreSearchTerm(`type:${categoryId}`);
    } else {
      setStoreSearchTerm('');
    }
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSearchTerm(searchTerm);
    setIsSearchOpen(false);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setStoreSearchTerm('');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-space-black/80 backdrop-blur-xl border-b border-electric-cyan/20' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-electric-cyan animate-pulse" />
                <div className="absolute inset-0 bg-electric-cyan/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
              </div>
              <h1 className="text-2xl font-space font-bold bg-gradient-to-r from-electric-cyan to-quantum-purple bg-clip-text text-transparent">
                Bowery Intelligence
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {activeCategory && (
                <button
                  onClick={() => handleCategoryClick(null)}
                  className="px-4 py-2 font-mono text-sm uppercase tracking-wider text-gray-400 hover:text-white transition-all duration-300"
                >
                  All News
                </button>
              )}
              {categories.map(({ id, label, colorClass, bgClass, borderClass }) => (
                <button
                  key={id}
                  onClick={() => handleCategoryClick(id)}
                  className={`relative px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                    activeCategory === id
                      ? colorClass
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  {activeCategory === id && (
                    <>
                      <div className={`absolute inset-0 ${bgClass} rounded-lg`} />
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${borderClass}`} />
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Right Section - Search & Menu */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-400 hover:text-electric-cyan transition-colors duration-300"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  haptics.light();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="lg:hidden p-2 text-gray-400 hover:text-electric-cyan transition-colors duration-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`absolute top-full left-0 right-0 bg-space-black/95 backdrop-blur-xl border-b border-electric-cyan/20 transition-all duration-300 ${
          isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for news, topics, or companies..."
                className="w-full px-6 py-4 bg-white/5 border border-electric-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-cyan focus:ring-2 focus:ring-electric-cyan/20 transition-all duration-300"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-electric-cyan/20 hover:bg-electric-cyan/30 text-electric-cyan rounded-md transition-colors duration-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-space-black/80 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-space-black/95 backdrop-blur-xl border-l border-electric-cyan/20 transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full pt-24 px-6">
            <div className="space-y-2">
              {activeCategory && (
                <button
                  onClick={() => handleCategoryClick(null)}
                  className="w-full text-left px-4 py-3 font-mono text-lg uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg"
                >
                  All News
                </button>
              )}
              {categories.map(({ id, label, colorClass, bgClass }) => (
                <button
                  key={id}
                  onClick={() => handleCategoryClick(id)}
                  className={`w-full text-left px-4 py-3 font-mono text-lg uppercase tracking-wider transition-all duration-300 rounded-lg ${
                    activeCategory === id
                      ? `${colorClass} ${bgClass}`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Footer */}
            <div className="mt-auto pb-8">
              <div className="border-t border-electric-cyan/20 pt-8">
                <p className="text-gray-500 text-sm text-center">
                  © 2024 Bowery Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20" />
    </>
  );
};