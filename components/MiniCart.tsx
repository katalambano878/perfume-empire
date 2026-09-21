'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const panel = (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/50 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[90] flex flex-col h-[100dvh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <h2 className="text-xl font-semibold text-neutral-900">
            Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full"
            aria-label="Close cart"
          >
            <i className="ri-close-line text-2xl text-neutral-700" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 flex items-center justify-center bg-neutral-100 rounded-full mb-4">
              <i className="ri-shopping-cart-line text-5xl text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Your cart is empty</h3>
            <p className="text-neutral-500 mb-6">Add items to get started</p>
            <Link
              href="/shop"
              onClick={onClose}
              className="px-6 py-3 bg-brand text-white rounded-full font-semibold hover:bg-brand-light transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="flex gap-4 bg-cream rounded-2xl p-4 min-h-[112px]">
                    <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0 border border-cream-dark">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">{item.name}</h3>
                      {item.variant && (
                        <p className="text-xs text-neutral-500 mb-2">
                          {item.variant}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-semibold tabular-nums text-brand">
                          GH₵{item.price.toFixed(2)}
                        </span>

                        <div className="flex items-center border border-neutral-200 rounded-full bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full"
                          >
                            {item.quantity <= (item.moq || 1) ? (
                              <i className="ri-delete-bin-line text-red-500" />
                            ) : (
                              <i className="ri-subtract-line text-neutral-700" />
                            )}
                          </button>
                          <span className="w-10 text-center font-semibold text-neutral-900 tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full"
                            disabled={item.quantity >= item.maxStock}
                          >
                            <i className="ri-add-line text-neutral-700" />
                          </button>
                        </div>
                      </div>
                      {item.quantity >= item.maxStock && (
                        <p className="text-xs text-amber-600 mt-1">Max stock reached</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full shrink-0 self-center"
                      aria-label={`Remove ${item.name}`}
                    >
                      <i className="ri-delete-bin-line text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-100 px-6 py-6 bg-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-600 font-medium">Subtotal</span>
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">GH₵{subtotal.toFixed(2)}</span>
              </div>

              <p className="text-sm text-neutral-500 mb-5 text-center">
                Shipping calculated at checkout
              </p>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full py-3.5 bg-brand text-white text-center rounded-full font-semibold hover:bg-brand-light transition-colors duration-200"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full py-3.5 border border-neutral-900 text-neutral-900 text-center rounded-full font-semibold hover:bg-neutral-50 transition-colors duration-200"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(panel, document.body);
}
