'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allProducts: SearchSuggestion[] = [
    {
      id: '1',
      name: 'Oud Intense Eau de Parfum',
      category: 'Unisex',
      price: 450,
      image: 'https://readdy.ai/api/search-image?query=luxury%20oud%20perfume%20bottle%20on%20clean%20white%20background%20professional%20fragrance%20photography&width=200&height=200&seq=search1&orientation=squarish'
    },
    {
      id: '2',
      name: 'Vanilla Musk Body Spray',
      category: 'Women\'s',
      price: 120,
      image: 'https://readdy.ai/api/search-image?query=vanilla%20musk%20body%20spray%20bottle%20on%20clean%20white%20background%20fragrance%20photography&width=200&height=200&seq=search2&orientation=squarish'
    },
    {
      id: '3',
      name: 'Citrus Fresh Eau de Toilette',
      category: 'Men\'s',
      price: 189,
      image: 'https://readdy.ai/api/search-image?query=citrus%20fresh%20perfume%20bottle%20on%20clean%20white%20background%20fragrance%20photography&width=200&height=200&seq=search3&orientation=squarish'
    },
    {
      id: '4',
      name: 'Rose Absolute Perfume Oil',
      category: 'Perfume Oils',
      price: 159,
      image: 'https://readdy.ai/api/search-image?query=rose%20perfume%20oil%20roll%20on%20on%20white%20background%20fragrance%20photography&width=200&height=200&seq=search4&orientation=squarish'
    },
    {
      id: '5',
      name: 'Amber Night Eau de Parfum',
      category: 'Unisex',
      price: 245,
      image: 'https://readdy.ai/api/search-image?query=amber%20perfume%20bottle%20on%20clean%20white%20background%20luxury%20fragrance%20photography&width=200&height=200&seq=search5&orientation=squarish'
    },
    {
      id: '6',
      name: 'Gift Set Trio',
      category: 'Gift Sets',
      price: 368,
      image: 'https://readdy.ai/api/search-image?query=perfume%20gift%20set%20three%20bottles%20on%20clean%20white%20background%20fragrance%20photography&width=200&height=200&seq=search6&orientation=squarish'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filter by query only; allProducts is large and would trigger too often
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => {
        setIsVoiceActive(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsVoiceActive(false);
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognition.start();
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
              setIsOpen(false);
            }
          }}
          placeholder="Search products, categories..."
          className="w-full pl-12 pr-24 py-3 border-2 border-gray-300 rounded-full focus:border-brand focus:ring-2 focus:ring-brand-muted text-sm"
        />
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <button
            onClick={handleVoiceSearch}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <i className="ri-mic-line"></i>
          </button>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {query.trim() && suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 px-3 py-2">Products</p>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    handleSearch(product.name);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover object-top rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <p className="font-bold text-gray-900">GH₵{product.price}</p>
                </Link>
              ))}
            </div>
          )}

          {query.trim() && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}

          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-semibold text-gray-500">Recent Searches</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-brand hover:text-brand-dark font-medium whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <i className="ri-history-line text-gray-400"></i>
                  <span className="flex-1 text-gray-700">{search}</span>
                  <i className="ri-arrow-right-up-line text-gray-400"></i>
                </button>
              ))}
            </div>
          )}

          {!query.trim() && recentSearches.length === 0 && (
            <div className="p-6">
              <p className="text-xs font-semibold text-gray-500 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Oud', 'Vanilla', 'Citrus', 'Rose', 'Amber', 'Gift Set'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      handleSearch(tag);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
