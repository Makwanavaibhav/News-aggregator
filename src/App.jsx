import React, { useState, useEffect } from 'react';
import { 
  Search, Sun, Moon, Bookmark, Compass, 
  TrendingUp, Clock, ChevronRight, Menu, X, BookmarkCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  'general', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'
];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [category, setCategory] = useState('general');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [savedArticles, setSavedArticles] = useState(() => {
    const saved = localStorage.getItem('savedNews');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaved, setShowSaved] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch news (NewsAPI.org — dev uses Vite proxy at /api/news; production uses same route via Vercel api/news.js)
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category });
        const response = await fetch(`api/news?${params}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        if (data.status === 'error') {
          throw new Error(data.message || 'NewsAPI error');
        }

        let fetchedArticles = data.articles || [];

        fetchedArticles = fetchedArticles.filter(
          (a) => a.title && a.title !== '[Removed]'
        );

        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback mock data if API fails
        setArticles([
          {
            title: "Apple announces groundbreaking AI integrations in latest OS update",
            description: "The highly anticipated WWDC event revealed major shifts in the ecosystem with profound AI features targeting productivity and privacy.",
            urlToImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
            source: { name: "TechCrunch" },
            publishedAt: new Date().toISOString(),
            url: "#",
          },
          {
            title: "Global markets rally as inflation cools slightly",
            description: "Investors reacted positively to the latest economic reports, sending major indices up by over 2% in early trading.",
            urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?auto=format&fit=crop&w=800&q=80",
            source: { name: "Bloomberg" },
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: "#",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const toggleSaveArticle = (article) => {
    setSavedArticles(prev => {
      const isSaved = prev.find(a => a.url === article.url);
      const updated = isSaved 
        ? prev.filter(a => a.url !== article.url)
        : [...prev, article];
      localStorage.setItem('savedNews', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter articles based on search
  const displayedArticles = showSaved 
    ? savedArticles.filter(a => a.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : articles.filter(a => a.title.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const topStory = displayedArticles.length > 0 ? displayedArticles[0] : null;
  const regularArticles = displayedArticles.length > 1 ? displayedArticles.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-primary-dark transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => { setShowSaved(false); setCategory('general'); setSearchQuery(''); }}
              >
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Compass size={20} className="font-bold" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  News<span className="text-blue-600 dark:text-blue-400">Sphere</span>
                </span>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl px-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for topics, locations & sources"
                  className="input-field pl-10 h-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right Actons */}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setShowSaved(!showSaved)}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                  showSaved 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                title="Saved Articles"
              >
                {showSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                <span className="hidden sm:inline font-medium text-sm">Bookmarks</span>
                {savedArticles.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {savedArticles.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
                V
              </div>
            </div>
          </div>

          {/* Search Bar (Mobile) */}
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="input-field pl-10 w-full rounded-lg py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Categories */}
      <nav className={`border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-light)]/95 dark:bg-[#121212]/95 backdrop-blur-md sticky top-16 z-40 transition-all ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 py-3 md:space-x-8 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <li key={cat} className="flex-shrink-0">
                <button
                  onClick={() => {
                    setCategory(cat);
                    setShowSaved(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`capitalize px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat && !showSaved
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left/Main Column - Feed */}
        <div className="flex-1 w-full flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white capitalize flex items-center gap-2">
              {showSaved ? 'Saved For Later' : category + ' News'}
              {debouncedSearch && <span className="text-gray-600 dark:text-gray-400 font-normal text-lg">› "{debouncedSearch}"</span>}
            </h1>
            <div className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-1 font-medium bg-gray-200/80 dark:bg-gray-800 px-3 py-1 rounded-full">
              <TrendingUp size={16} className="text-green-500" /> Top Stories
            </div>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="w-full h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : displayedArticles.length === 0 ? (
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-12 text-center text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-800 border-dashed">
              <Compass size={48} className="mx-auto mb-4 text-gray-500 dark:text-gray-400 opacity-80" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No articles found.</p>
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-400">{showSaved ? "You haven't saved any articles yet." : "Try adjusting your search criteria."}</p>
            </div>
          ) : (
            <>
              {/* Top Hero Story */}
              {topStory && (
                <div className="group relative w-full rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] cursor-pointer">
                  <div className="absolute inset-0">
                    <img 
                      src={topStory.urlToImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
                      alt={topStory.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  </div>
                  
                  <div className="relative p-6 sm:p-8 flex flex-col justify-end h-80 sm:h-96">
                    <div className="flex gap-2 mb-3">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {topStory.source.name}
                      </span>
                    </div>
                    <a href={topStory.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-4 decoration-white">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                        {topStory.title}
                      </h2>
                    </a>
                    <div className="flex items-center text-gray-300 text-sm font-medium">
                      <Clock size={16} className="mr-1 mt-0.5 opacity-80" />
                      {topStory.publishedAt ? formatDistanceToNow(new Date(topStory.publishedAt), { addSuffix: true }) : 'Recently'}
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSaveArticle(topStory);
                        }}
                        className="ml-auto p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition z-10"
                      >
                        <Bookmark size={18} fill={savedArticles.find(a => a.url === topStory.url) ? 'currentColor' : 'none'} className={savedArticles.find(a => a.url === topStory.url) ? 'text-blue-400' : 'text-white'} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {regularArticles.map((article, idx) => (
                  <div key={idx} className="card group flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="relative block h-48 overflow-hidden">
                      <img 
                        src={article.urlToImage || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80`} 
                        alt="News thumbnail" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-800 dark:text-gray-200">
                        {article.source.name}
                      </div>
                    </a>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white mb-2 line-clamp-3">
                          {article.title}
                        </h3>
                      </a>
                      {article.description && (
                        <p className="text-gray-700 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {article.description}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-600 dark:text-gray-500 font-medium flex items-center">
                          <Clock size={14} className="mr-1 opacity-70" />
                          {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : 'Recently'}
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleSaveArticle(article)}
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition p-1"
                            title="Save for later"
                          >
                            <Bookmark 
                              size={18} 
                              fill={savedArticles.find(a => a.url === article.url) ? 'currentColor' : 'none'} 
                              className={savedArticles.find(a => a.url === article.url) ? 'text-blue-600 dark:text-blue-400' : ''}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar - Creative Feature: Daily Briefing */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            
            {/* Daily Briefing Card */}
            <div className="card overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/50">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-600 p-1.5 rounded text-white">
                    <Compass size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Daily AI Briefing</h3>
                </div>
                
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-4 leading-relaxed bg-blue-100/50 dark:bg-blue-900/30 p-3 rounded-lg">
                  {loading ? 'Analyzing top stories...' : 
                    topStory 
                      ? `${topStory.source.name} leads today's coverage on ${category} with major developments. Keep an eye on the market responses and global impacts.`
                      : 'Catch up on the latest insights tailored to your reading profile.'}
                </p>
                
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-gray-700 dark:text-gray-500 tracking-wider">Quick Hits</h4>
                  {(articles.slice(1, 4)).map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {a.title}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-red-500" /> 
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Artificial Intelligence', 'SpaceX', 'Federal Reserve', 'Elections 2026', 'Cybersecurity', 'Climate Change'].map((topic, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSearchQuery(topic);
                      setShowSaved(false);
                      setCategory('general');
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-600 dark:text-gray-500 mt-4">
              © 2026 NewsSphere • Privacy Policy
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
