'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db/http-client';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
    initialData?: any;
    isEditMode?: boolean;
}

export default function ProductForm({ initialData, isEditMode = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [productName, setProductName] = useState(initialData?.name || '');
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [comparePrice, setComparePrice] = useState(initialData?.compare_at_price || '');
    const [sku, setSku] = useState(initialData?.sku || '');
    const [stock, setStock] = useState(initialData?.quantity || '');
    const [moq, setMoq] = useState(initialData?.moq || '1');
    const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.metadata?.low_stock_threshold || '5');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState(initialData?.status || 'Active');
    const [featured, setFeatured] = useState(initialData?.featured || false);
    const [preorderShipping, setPreorderShipping] = useState(initialData?.metadata?.preorder_shipping || '');
    const [activeTab, setActiveTab] = useState('general');

    // Auto-generate SKU function
    const generateSku = () => {
        const prefix = 'TPE'; // The Perfume Empire
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    };

    // --- Variant System ---
    // Preset color palette
    const colorPresets = [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Red', hex: '#EF4444' },
        { name: 'Blue', hex: '#3B82F6' },
        { name: 'Navy', hex: '#1E3A5F' },
        { name: 'Green', hex: '#22C55E' },
        { name: 'Yellow', hex: '#EAB308' },
        { name: 'Pink', hex: '#EC4899' },
        { name: 'Purple', hex: '#A855F7' },
        { name: 'Orange', hex: '#F97316' },
        { name: 'Gray', hex: '#6B7280' },
        { name: 'Brown', hex: '#92400E' },
        { name: 'Beige', hex: '#D2B48C' },
        { name: 'Maroon', hex: '#800000' },
        { name: 'Teal', hex: '#14B8A6' },
        { name: 'Cream', hex: '#FFFDD0' },
        { name: 'Gold', hex: '#D4AF37' },
        { name: 'Silver', hex: '#C0C0C0' },
    ];
    const sizePresets = ['30ml', '50ml', '75ml', '100ml', '150ml', '200ml'];
    const concentrationPresets = ['EDT', 'EDP', 'Parfum', 'Extrait', 'Attar', 'Oil'];

    // Parse existing variants to extract unique colors and sizes
    const existingVariants = (initialData?.product_variants || []).map((v: any) => ({
        ...v,
        stock: v.stock ?? v.quantity ?? 0,
        color: v.color ?? v.option2 ?? '',
        size: v.option1 || v.name || '',
        concentration: v.option3 || ''
    }));

    const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>(() => {
        const colors = new Map<string, string>();
        existingVariants.forEach((v: any) => {
            if (v.color) {
                const preset = colorPresets.find(c => c.name.toLowerCase() === v.color.toLowerCase());
                colors.set(v.color, preset?.hex || '#888888');
            }
        });
        return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }));
    });

    const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
        const sizes = new Set<string>();
        existingVariants.forEach((v: any) => {
            if (v.size) sizes.add(v.size);
        });
        return Array.from(sizes);
    });

    const [customColorName, setCustomColorName] = useState('');
    const [customColorHex, setCustomColorHex] = useState('#888888');
    const [customSize, setCustomSize] = useState('');
    const [selectedConcentrations, setSelectedConcentrations] = useState<string[]>(() => {
        const values = new Set<string>();
        existingVariants.forEach((v: any) => {
            if (v.concentration) values.add(v.concentration);
        });
        return Array.from(values);
    });
    const [customConcentration, setCustomConcentration] = useState('');

    const buildVariantKey = (color: string, size: string, concentration = '') => `${color}|||${size}|||${concentration}`;
    const blankVariant = () => ({ price: String(price || ''), compare: '', cost: '', stock: '0', sku: '', barcode: '' });

    const [variantData, setVariantData] = useState<Record<string, { price: string; compare: string; cost: string; stock: string; sku: string; barcode: string }>>(() => {
        const data: Record<string, { price: string; compare: string; cost: string; stock: string; sku: string; barcode: string }> = {};
        existingVariants.forEach((v: any) => {
            const key = buildVariantKey(v.color || '', v.size || '', v.concentration || '');
            data[key] = {
                price: v.price?.toString() || '',
                compare: v.compare_at_price?.toString() || '',
                cost: v.cost_per_item?.toString() || '',
                stock: v.stock?.toString() || '0',
                sku: v.sku || '',
                barcode: v.barcode || ''
            };
        });
        return data;
    });

    // Computed: all variant combinations
    const variantCombinations = (() => {
        const combos: { color: string; colorHex: string; size: string; concentration: string; key: string }[] = [];
        const colors = selectedColors.length > 0 ? selectedColors : [{ name: '', hex: '' }];
        const sizes = selectedSizes.length > 0 ? selectedSizes : [''];
        const concentrations = selectedConcentrations.length > 0 ? selectedConcentrations : [''];

        for (const color of colors) {
            for (const size of sizes) {
                for (const concentration of concentrations) {
                    if (!color.name && !size && !concentration) continue;
                    const key = buildVariantKey(color.name, size, concentration);
                    combos.push({ color: color.name, colorHex: color.hex, size, concentration, key });
                }
            }
        }
        return combos;
    })();

    // Build the flat variants array for saving (used by handleSubmit)
    const variants = variantCombinations.map(combo => {
        const d = variantData[combo.key] || blankVariant();
        return {
            name: [combo.size, combo.concentration].filter(Boolean).join(' · ') || combo.color || 'Default',
            color: combo.color,
            concentration: combo.concentration,
            sku: d.sku,
            barcode: d.barcode,
            price: d.price || price,
            compare: d.compare,
            cost: d.cost,
            stock: d.stock || '0'
        };
    });

    const updateVariantField = (key: string, field: string, value: string) => {
        setVariantData(prev => ({
            ...prev,
            [key]: { ...(prev[key] || blankVariant()), [field]: value }
        }));
    };

    // Bulk set price/stock for all variants
    const bulkSetField = (field: 'price' | 'stock', value: string) => {
        setVariantData(prev => {
            const updated = { ...prev };
            variantCombinations.forEach(combo => {
                updated[combo.key] = { ...(updated[combo.key] || blankVariant()), [field]: value };
            });
            return updated;
        });
    };

    const toggleColor = (color: { name: string; hex: string }) => {
        setSelectedColors(prev => {
            const exists = prev.find(c => c.name === color.name);
            if (exists) return prev.filter(c => c.name !== color.name);
            return [...prev, color];
        });
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => {
            if (prev.includes(size)) return prev.filter(s => s !== size);
            return [...prev, size];
        });
    };

    const addCustomColor = () => {
        if (!customColorName.trim()) return;
        const exists = selectedColors.find(c => c.name.toLowerCase() === customColorName.trim().toLowerCase());
        if (!exists) {
            setSelectedColors(prev => [...prev, { name: customColorName.trim(), hex: customColorHex }]);
        }
        setCustomColorName('');
        setCustomColorHex('#888888');
    };

    const addCustomSize = () => {
        if (!customSize.trim()) return;
        if (!selectedSizes.includes(customSize.trim())) {
            setSelectedSizes(prev => [...prev, customSize.trim()]);
        }
        setCustomSize('');
    };

    const toggleConcentration = (value: string) => {
        setSelectedConcentrations(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    const addCustomConcentration = () => {
        const value = customConcentration.trim();
        if (!value || selectedConcentrations.includes(value)) return;
        setSelectedConcentrations(prev => [...prev, value]);
        setCustomConcentration('');
    };

    // Images
    const [images, setImages] = useState<any[]>(initialData?.product_images || []);
    const [uploading, setUploading] = useState(false);

    // SEO
    const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.seo_description || '');
    const [urlSlug, setUrlSlug] = useState(initialData?.slug || '');
    const [keywords, setKeywords] = useState(initialData?.tags?.join(', ') || '');
    const savedSeo = initialData?.metadata?.seo || {};
    const [focusKeyword, setFocusKeyword] = useState(savedSeo.focusKeyword || '');
    const [ogTitle, setOgTitle] = useState(savedSeo.ogTitle || '');
    const [ogDescription, setOgDescription] = useState(savedSeo.ogDescription || '');
    const [noindex, setNoindex] = useState(!!savedSeo.noindex);
    const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);

    const tabs = [
        { id: 'general', label: 'General', icon: 'ri-information-line' },
        { id: 'pricing', label: 'Pricing & Inventory', icon: 'ri-price-tag-3-line' },
        { id: 'variants', label: 'Variants', icon: 'ri-layout-grid-line' },
        { id: 'images', label: 'Images', icon: 'ri-image-line' },
        { id: 'seo', label: 'SEO', icon: 'ri-search-line' }
    ];

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await db.from('categories').select('id, name').eq('status', 'active');
            if (data) {
                setCategories(data);
                if (data.length > 0 && !categoryId) {
                    setCategoryId(data[0].id);
                }
            }
        }
        fetchCategories();
    }, [categoryId]);

    // Auto-generate slug from name if not manually edited
    useEffect(() => {
        if (!isEditMode && !slugTouched && productName) {
            setUrlSlug(productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [productName, isEditMode, slugTouched]);

    // Auto-generate SKU for new products
    useEffect(() => {
        if (!isEditMode && !sku) {
            setSku(generateSku());
        }
    }, [isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;

            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await db.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = db.storage
                .from('products')
                .getPublicUrl(filePath);

            setImages([...images, { url: publicUrl, position: images.length }]);

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    // Variant helpers removed — variants are now auto-generated from selectedColors × selectedSizes

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // If product has variants, auto-sync main stock = sum of variant stocks
            const hasVariants = variants.length > 0;
            const variantStockTotal = hasVariants
                ? variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                : parseInt(stock) || 0;

            const productData = {
                name: productName,
                slug: urlSlug || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                description,
                category_id: categoryId || null,
                price: parseFloat(price) || 0,
                compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
                sku: sku || generateSku(), // Auto-generate if empty
                quantity: hasVariants ? variantStockTotal : (parseInt(stock) || 0),
                moq: parseInt(moq) || 1,
                status: status.toLowerCase(),
                featured,
                seo_title: seoTitle,
                seo_description: metaDescription,
                tags: (keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean),
                metadata: {
                    low_stock_threshold: parseInt(lowStockThreshold) || 5,
                    preorder_shipping: preorderShipping.trim() || null,
                    seo: {
                        focusKeyword,
                        ogTitle,
                        ogDescription,
                        noindex
                    }
                }
            };

            let productId = initialData?.id;
            let error;

            if (isEditMode && productId) {
                // Update existing
                const { error: updateError } = await db
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                error = updateError;
            } else {
                // Create new
                const { data: newProduct, error: insertError } = await db.insertOne('products', productData);

                if (newProduct) productId = newProduct.id;
                error = insertError;
            }

            if (error) throw error;

            // Update Images
            if (productId) {
                // Strategy: We will just delete all old images/variants and recreate them for simplicity in this MVP.
                // In a clearer implementation, we would diff them.

                // 1. Images
                if (isEditMode) {
                    await db.from('product_images').delete().eq('product_id', productId);
                }
                if (images.length > 0) {
                    const imageInserts = images.map((img, idx) => ({
                        product_id: productId,
                        url: img.url,
                        position: idx,
                        alt_text: productName
                    }));
                    await db.from('product_images').insert(imageInserts);
                }

                // 2. Variants
                if (isEditMode) {
                    // Be careful not to delete ALL variants if we want to preserve IDs etc, 
                    // but for now, full replacement is safer to ensure sync.
                    // Note: This might break order-item references if they rely on variant_id hard constraints without cascading.
                    // Our Schema migration has ON DELETE SET NULL for order_items -> variant_id, so this is safe for now (but distinct from "archiving").
                    await db.from('product_variants').delete().eq('product_id', productId);
                }

                if (variants.length > 0) {
                    const variantInserts = variants.map(v => {
                        const colorHex = selectedColors.find(c => c.name === v.color)?.hex || null;
                        return {
                            product_id: productId,
                            name: v.name || v.color || 'Default',
                            sku: v.sku || null,
                            barcode: v.barcode || null,
                            price: parseFloat(v.price) || 0,
                            compare_at_price: v.compare ? parseFloat(v.compare) : null,
                            cost_per_item: v.cost ? parseFloat(v.cost) : null,
                            quantity: parseInt(v.stock) || 0,
                            option1: v.name?.split(' · ')[0] || null,
                            option2: v.color?.trim() || null,
                            option3: v.concentration || null,
                            metadata: colorHex ? { color_hex: colorHex } : {}
                        };
                    });
                    const { error: varError } = await db.from('product_variants').insert(variantInserts);
                    if (varError) throw varError;
                }
            }

            alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
            router.push('/admin/products');

        } catch (err: any) {
            console.error('Error saving product:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/products"
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                        <i className="ri-arrow-left-line text-xl text-gray-700"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditMode ? 'Update product information and settings' : 'Create a new product for your catalog'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {isEditMode && (
                        <Link
                            href={`/product/${initialData?.id}`}
                            target="_blank"
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center"
                        >
                            <i className="ri-eye-line mr-2"></i>
                            Preview
                        </Link>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <i className="ri-loader-4-line animate-spin mr-2"></i>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="ri-save-line mr-2"></i>
                                {isEditMode ? 'Save Changes' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <div className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${activeTab === tab.id
                                    ? 'border-brand text-brand bg-cream'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <i className={`${tab.icon} text-xl`}></i>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    maxLength={500}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                                    placeholder="Describe your product..."
                                />
                                <p className="text-sm text-gray-500 mt-2">{description.length}/500 characters</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
                                    >
                                        {categories.length === 0 && <option value="">Loading categories...</option>}
                                        {categories.length > 0 && <option value="">Select a category</option>}
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
                                    >
                                        <option>Active</option>
                                        <option>Draft</option>
                                        <option>Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={featured}
                                    onChange={(e) => setFeatured(e.target.checked)}
                                    className="w-5 h-5 text-brand border-gray-300 rounded focus:ring-brand cursor-pointer"
                                />
                                <label className="text-gray-900 font-medium">
                                    Feature this product on homepage
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Pre-order / Estimated Shipping
                                </label>
                                <input
                                    type="text"
                                    value={preorderShipping}
                                    onChange={(e) => setPreorderShipping(e.target.value)}
                                    placeholder="e.g., Ships in 14 days, Available March 15"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty if product ships immediately. Otherwise, enter estimated shipping time.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-6 max-w-3xl">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Price (GH₵) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">GH₵</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Compare at Price (GH₵)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">GH₵</span>
                                        <input
                                            type="number"
                                            value={comparePrice}
                                            onChange={(e) => setComparePrice(e.target.value)}
                                            className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Show original price for comparison</p>
                                </div>
                            </div>

                            <div className="p-4 bg-cream border border-cream-dark rounded-lg">
                                <p className="text-brand-dark font-semibold mb-1">Discount Calculation</p>
                                {price && comparePrice && parseFloat(comparePrice) > parseFloat(price) ? (
                                    <p className="text-brand">
                                        Savings: GH₵ {(parseFloat(comparePrice) - parseFloat(price)).toFixed(2)}
                                        <span className="ml-2">
                                            ({(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100).toFixed(0)}% off)
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-brand text-sm">Enter a valid compare price higher than the price to see discount.</p>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            SKU (Auto-generated)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sku}
                                                onChange={(e) => setSku(e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand font-mono bg-gray-50"
                                                placeholder="Auto-generated"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSku(generateSku())}
                                                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-brand hover:bg-cream transition-colors cursor-pointer"
                                                title="Generate new SKU"
                                            >
                                                <i className="ri-refresh-line text-lg"></i>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">SKU is auto-generated. Click refresh to generate a new one.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Stock Quantity *
                                        </label>
                                        {variants.length > 0 ? (
                                            <div>
                                                <input
                                                    type="number"
                                                    value={variants.reduce((sum: number, v: any) => sum + (parseInt(v.stock) || 0), 0)}
                                                    readOnly
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                />
                                                <p className="text-sm text-amber-600 mt-1 flex items-center">
                                                    <i className="ri-information-line mr-1"></i>
                                                    Stock is managed per variant. Edit stock in the Variants tab.
                                                </p>
                                            </div>
                                        ) : (
                                            <input
                                                type="number"
                                                value={stock}
                                                onChange={(e) => setStock(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                                placeholder="0"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Minimum Order Quantity (MOQ)
                                        </label>
                                        <input
                                            type="number"
                                            value={moq}
                                            onChange={(e) => setMoq(e.target.value)}
                                            min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                            placeholder="1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Minimum quantity customers must order</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Low Stock Threshold
                                        </label>
                                        <input
                                            type="number"
                                            value={lowStockThreshold}
                                            onChange={(e) => setLowStockThreshold(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Get notified when stock falls below this number</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'variants' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                                <p className="text-gray-600 mt-1">Build bottles by volume, concentration, and finish. Add your own labels for anything that is not on the list.</p>
                            </div>

                            {/* STEP 1: Colors */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                                    <i className="ri-palette-line mr-2 text-lg text-brand"></i>
                                    Step 1: Select Colors
                                    {selectedColors.length > 0 && (
                                        <span className="ml-2 bg-brand-muted text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {selectedColors.length} selected
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">Click colors to add/remove. Skip if product has no color options.</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {colorPresets.map(color => {
                                        const isSelected = selectedColors.some(c => c.name === color.name);
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => toggleColor(color)}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${isSelected
                                                        ? 'border-brand bg-cream ring-1 ring-brand'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                title={color.name}
                                            >
                                                <span
                                                    className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                                                    style={{ backgroundColor: color.hex }}
                                                ></span>
                                                <span className={isSelected ? 'text-brand' : 'text-gray-700'}>{color.name}</span>
                                                {isSelected && <i className="ri-check-line text-brand"></i>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom color */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                    <input
                                        type="color"
                                        value={customColorHex}
                                        onChange={(e) => setCustomColorHex(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                                        title="Pick a custom color"
                                    />
                                    <input
                                        type="text"
                                        value={customColorName}
                                        onChange={(e) => setCustomColorName(e.target.value)}
                                        placeholder="Custom color name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomColor()}
                                    />
                                    <button
                                        onClick={addCustomColor}
                                        disabled={!customColorName.trim()}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Color
                                    </button>
                                </div>

                                {/* Selected colors summary */}
                                {selectedColors.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedColors.map(color => (
                                            <span key={color.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm">
                                                <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }}></span>
                                                {color.name}
                                                <button onClick={() => toggleColor(color)} className="text-gray-400 hover:text-red-500 ml-1">
                                                    <i className="ri-close-line text-sm"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* STEP 2: Sizes */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                                    <i className="ri-ruler-line mr-2 text-lg text-brand"></i>
                                    Step 2: Volume
                                    {selectedSizes.length > 0 && (
                                        <span className="ml-2 bg-brand-muted text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {selectedSizes.length} selected
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">Pick a bottle size, or type your own such as 10ml, 125ml, or a gift set.</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {sizePresets.map(size => {
                                        const isSelected = selectedSizes.includes(size);
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => toggleSize(size)}
                                                className={`px-5 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${isSelected
                                                        ? 'border-brand bg-cream text-brand ring-1 ring-brand'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                                                    }`}
                                            >
                                                {size}
                                                {isSelected && <i className="ri-check-line ml-1.5 text-brand"></i>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom size */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                    <input
                                        type="text"
                                        value={customSize}
                                        onChange={(e) => setCustomSize(e.target.value)}
                                        placeholder="Custom volume, for example 10ml or gift set"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomSize()}
                                    />
                                    <button
                                        onClick={addCustomSize}
                                        disabled={!customSize.trim()}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Size
                                    </button>
                                </div>

                                {/* Selected sizes summary */}
                                {selectedSizes.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedSizes.map(size => (
                                            <span key={size} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm font-medium">
                                                {size}
                                                <button onClick={() => toggleSize(size)} className="text-gray-400 hover:text-red-500 ml-1">
                                                    <i className="ri-close-line text-sm"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center">
                                    <i className="ri-flask-line mr-2 text-lg text-brand"></i>
                                    Step 3: Concentration
                                    {selectedConcentrations.length > 0 && (
                                        <span className="ml-2 bg-brand-muted text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {selectedConcentrations.length} selected
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">Optional. Skip this if every bottle is the same strength.</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {concentrationPresets.map(value => {
                                        const isSelected = selectedConcentrations.includes(value);
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => toggleConcentration(value)}
                                                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold ${isSelected ? 'border-brand bg-cream text-brand' : 'border-gray-200 bg-white text-gray-700'}`}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                    <input
                                        type="text"
                                        value={customConcentration}
                                        onChange={(e) => setCustomConcentration(e.target.value)}
                                        placeholder="Custom strength, for example Body mist"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomConcentration()}
                                    />
                                    <button type="button" onClick={addCustomConcentration} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">Add</button>
                                </div>
                            </div>

                            {/* STEP 4: Variant Grid */}
                            {variantCombinations.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                                <i className="ri-grid-line mr-2 text-lg text-purple-600"></i>
                                                Price, cost, and stock ({variantCombinations.length})
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const val = prompt('Set price for ALL variants:', price?.toString() || '0');
                                                    if (val !== null) bulkSetField('price', val);
                                                }}
                                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Bulk Set Price
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const val = prompt('Set stock for ALL variants:', '0');
                                                    if (val !== null) bulkSetField('stock', val);
                                                }}
                                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Bulk Set Stock
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    {selectedColors.length > 0 && (
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Color</th>
                                                    )}
                                                    {selectedSizes.length > 0 && (
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Volume</th>
                                                    )}
                                                    {selectedConcentrations.length > 0 && (
                                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Strength</th>
                                                    )}
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Compare</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Barcode</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variantCombinations.map((combo) => {
                                                    const d = variantData[combo.key] || blankVariant();
                                                    return (
                                                        <tr key={combo.key} className="border-b border-gray-100 hover:bg-gray-50">
                                                            {selectedColors.length > 0 && (
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                                                                            style={{ backgroundColor: combo.colorHex }}
                                                                        ></span>
                                                                        <span className="text-sm font-medium text-gray-900">{combo.color}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            {selectedSizes.length > 0 && (
                                                                <td className="py-3 px-4">
                                                                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded">
                                                                        {combo.size}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {selectedConcentrations.length > 0 && (
                                                                <td className="py-3 px-4 text-sm font-medium">{combo.concentration}</td>
                                                            )}
                                                            {(['price', 'compare', 'cost', 'stock', 'sku', 'barcode'] as const).map((field) => (
                                                                <td key={field} className="py-3 px-4">
                                                                    <input
                                                                        type={field === 'sku' || field === 'barcode' ? 'text' : 'number'}
                                                                        value={d[field]}
                                                                        onChange={(e) => updateVariantField(combo.key, field, e.target.value)}
                                                                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                                        step={field === 'sku' || field === 'barcode' ? undefined : '0.01'}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-3 bg-cream border-t border-cream-dark">
                                        <p className="text-xs text-brand flex items-center">
                                            <i className="ri-information-line mr-1.5"></i>
                                            Total stock across all variants: <strong className="ml-1">{variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}</strong>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {variantCombinations.length === 0 && (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <i className="ri-palette-line text-4xl text-gray-300 mb-2 block"></i>
                                    <p className="font-medium">No variants configured</p>
                                    <p className="text-sm mt-1">Select colors and/or sizes above to create variant combinations.</p>
                                    <p className="text-xs mt-2 text-gray-400">You can add just colors, just sizes, or both for a full grid.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Product Images</h3>
                                <p className="text-gray-600">Add up to 10 images. First image will be the primary image.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img: any, index: number) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                                            <img src={img.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                        {index === 0 && (
                                            <span className="absolute top-2 left-2 bg-brand text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                                                Primary
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-xl">
                                            <a href={img.url} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                                <i className="ri-eye-line"></i>
                                            </a>
                                            <button
                                                onClick={() => handleRemoveImage(index)}
                                                className="w-9 h-9 flex items-center justify-center bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <label className={`aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-brand hover:bg-cream transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-brand cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <i className="ri-loader-4-line animate-spin text-3xl"></i>
                                    ) : (
                                        <i className="ri-upload-2-line text-3xl"></i>
                                    )}
                                    <span className="text-sm font-semibold">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Image Guidelines:</strong> Use high-quality images (min 1000x1000px), white or neutral backgrounds work best.
                                    Supported formats: JPG, PNG, WebP (max 5MB each).
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <SeoPanel
                            productName={productName}
                            description={description}
                            seoTitle={seoTitle}
                            setSeoTitle={setSeoTitle}
                            metaDescription={metaDescription}
                            setMetaDescription={setMetaDescription}
                            urlSlug={urlSlug}
                            setUrlSlug={(value) => { setSlugTouched(true); setUrlSlug(value); }}
                            keywords={keywords}
                            setKeywords={setKeywords}
                            focusKeyword={focusKeyword}
                            setFocusKeyword={setFocusKeyword}
                            ogTitle={ogTitle}
                            setOgTitle={setOgTitle}
                            ogDescription={ogDescription}
                            setOgDescription={setOgDescription}
                            noindex={noindex}
                            setNoindex={setNoindex}
                            imageCount={images.length}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function SeoPanel({
    productName, description, seoTitle, setSeoTitle, metaDescription, setMetaDescription,
    urlSlug, setUrlSlug, keywords, setKeywords, focusKeyword, setFocusKeyword,
    ogTitle, setOgTitle, ogDescription, setOgDescription, noindex, setNoindex, imageCount,
}: {
    productName: string;
    description: string;
    seoTitle: string;
    setSeoTitle: (value: string) => void;
    metaDescription: string;
    setMetaDescription: (value: string) => void;
    urlSlug: string;
    setUrlSlug: (value: string) => void;
    keywords: string;
    setKeywords: (value: string) => void;
    focusKeyword: string;
    setFocusKeyword: (value: string) => void;
    ogTitle: string;
    setOgTitle: (value: string) => void;
    ogDescription: string;
    setOgDescription: (value: string) => void;
    noindex: boolean;
    setNoindex: (value: boolean) => void;
    imageCount: number;
}) {
    const title = seoTitle || `${productName || 'Product'} | The Perfume Empire`;
    const snippet = metaDescription || description || 'Add a description so Google has something to show.';
    const slug = urlSlug || 'product-slug';
    const keyword = focusKeyword.trim().toLowerCase();
    const checks = [
        { ok: title.length >= 45 && title.length <= 60, label: 'Title is 45–60 characters' },
        { ok: snippet.length >= 120 && snippet.length <= 160, label: 'Description is 120–160 characters' },
        { ok: !keyword || title.toLowerCase().includes(keyword), label: 'Focus keyword is in the title' },
        { ok: !keyword || snippet.toLowerCase().includes(keyword), label: 'Focus keyword is in the description' },
        { ok: !keyword || slug.includes(slugify(keyword)), label: 'Focus keyword is in the URL' },
        { ok: imageCount > 0, label: 'Product has at least one image' },
    ];
    const score = checks.filter((item) => item.ok).length;

    return (
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="space-y-5">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Search listing</h3>
                    <p className="text-gray-600 text-sm">This is what Google and link previews can show for this bottle.</p>
                </div>
                <label className="block text-sm font-semibold">Focus keyword
                    <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="oud perfume Accra" className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                </label>
                <label className="block text-sm font-semibold">Page title
                    <input value={seoTitle} maxLength={70} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${productName || 'Product name'} | The Perfume Empire`} className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                    <span className={`text-xs ${title.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>{title.length}/60 shown in Google</span>
                </label>
                <label className="block text-sm font-semibold">Meta description
                    <textarea value={metaDescription} maxLength={320} rows={4} onChange={(e) => setMetaDescription(e.target.value)} className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Who it is for, the main notes, and where to buy it." />
                    <span className={`text-xs ${snippet.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>{snippet.length}/160 shown in Google</span>
                </label>
                <div>
                    <label className="block text-sm font-semibold mb-2">URL</label>
                    <div className="flex">
                        <span className="bg-gray-100 px-3 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">tpeperfumes.com/product/</span>
                        <input value={urlSlug} onChange={(e) => setUrlSlug(slugify(e.target.value))} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg" />
                    </div>
                    <button type="button" className="mt-2 text-sm font-semibold text-brand" onClick={() => setUrlSlug(slugify(productName || focusKeyword))}>Build slug from the product name</button>
                </div>
                <label className="block text-sm font-semibold">Keywords
                    <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="oud, east legon, niche perfume" className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block text-sm font-semibold">Share title
                        <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Uses the page title if empty" className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                    </label>
                    <label className="block text-sm font-semibold">Share description
                        <input value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="Uses the meta description if empty" className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                    </label>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
                    Hide this product from Google
                </label>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setSeoTitle(`${productName} | The Perfume Empire`.slice(0, 60))}>Write title</button>
                    <button type="button" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold" onClick={() => setMetaDescription((description || `${productName} from The Perfume Empire in East Legon.`).slice(0, 160))}>Write description</button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Google preview</p>
                    <p className="text-[#1a0dab] text-lg leading-snug">{title.slice(0, 60)}</p>
                    <p className="text-[#006621] text-sm mt-1">tpeperfumes.com/product/{slug}</p>
                    <p className="text-sm text-gray-600 mt-1">{snippet.slice(0, 160)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="font-semibold">Listing score {score}/{checks.length}</p>
                    <ul className="mt-3 space-y-2 text-sm">
                        {checks.map((item) => (
                            <li key={item.label} className={item.ok ? 'text-green-700' : 'text-gray-500'}>
                                {item.ok ? 'Ready' : 'Missing'} · {item.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
