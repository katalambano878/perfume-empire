'use client';

import { use, useEffect, useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { db } from '@/lib/db/http-client';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await db
          .from('products')
          .select('*')
          .eq('id', resolvedParams.id)
          .limit(1);

        if (error) throw error;
        const product = Array.isArray(data) ? data[0] : data;
        if (!product) return;

        const [{ data: images }, { data: variants }, { data: category }] = await Promise.all([
          db.from('product_images').select('*').eq('product_id', product.id),
          db.from('product_variants').select('*').eq('product_id', product.id),
          product.category_id
            ? db.from('categories').select('id, name').eq('id', product.category_id).limit(1)
            : Promise.resolve({ data: null }),
        ]);
        const categoryRow = Array.isArray(category) ? category[0] : category;
        setProductData({
          ...product,
          product_images: images || [],
          product_variants: variants || [],
          categories: categoryRow || null,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      fetchProduct();
    }
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-brand animate-spin mb-4 block"></i>
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4 block"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you are trying to edit does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return <ProductForm initialData={productData} isEditMode={true} />;
}
