'use client';

import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
}

export default function CartSuggestions() {
  const suggestedProducts: Product[] = [
    {
      id: '21',
      name: 'Oud Intense Eau de Parfum',
      price: 129.99,
      originalPrice: 179.99,
      image: 'https://readdy.ai/api/search-image?query=luxury%20oud%20perfume%20bottle%20on%20clean%20white%20studio%20background%20fragrance%20photography&width=400&height=400&seq=cart-sugg-1&orientation=squarish',
      rating: 4.8
    },
    {
      id: '22',
      name: 'Vanilla Musk Body Spray',
      price: 34.99,
      originalPrice: 49.99,
      image: 'https://readdy.ai/api/search-image?query=vanilla%20musk%20body%20spray%20on%20white%20marble%20fragrance%20photography&width=400&height=400&seq=cart-sugg-2&orientation=squarish',
      rating: 4.7
    },
    {
      id: '23',
      name: 'Rose Absolute Perfume Oil',
      price: 24.99,
      image: 'https://readdy.ai/api/search-image?query=rose%20perfume%20oil%20roll%20on%20on%20white%20surface%20fragrance%20photography&width=400&height=400&seq=cart-sugg-3&orientation=squarish',
      rating: 4.6
    },
    {
      id: '24',
      name: 'Citrus Fresh Travel Spray',
      price: 19.99,
      originalPrice: 29.99,
      image: 'https://readdy.ai/api/search-image?query=small%20travel%20perfume%20spray%20on%20clean%20white%20desk%20fragrance%20photography&width=400&height=400&seq=cart-sugg-4&orientation=squarish',
      rating: 4.5
    }
  ];

  return (
    <div className="bg-cream border-2 border-cream-dark rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">You Might Also Like</h3>
        <span className="text-sm text-brand font-medium whitespace-nowrap">Boost Your Order</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-brand">GH₵{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">GH₵{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button className="w-full py-2 bg-brand text-white text-sm rounded-lg font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap">
                  <i className="ri-add-line mr-1"></i>
                  Quick Add
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
