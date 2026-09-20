import { NextResponse } from 'next/server';

const SAMPLE_CSV = `name,description,category,price,compare_at_price,quantity,moq,status,featured,seo_title,seo_description,keywords,low_stock_threshold,preorder_shipping,images,variant_color,variant_color_hex,variant_size,variant_price,variant_stock
"Oud Intense Eau de Parfum","Rich oud fragrance with warm amber and musk. Long-lasting unisex eau de parfum.","Unisex",289.00,349.00,40,1,"Active",true,"Oud Intense Eau de Parfum","Shop Oud Intense at The Perfume Empire.","oud,perfume,unisex",5,,"oud-front.jpg;oud-box.jpg",,,,"50ml",289.00,25
"Vanilla Musk Body Spray","Soft vanilla and musk body spray for everyday wear.","Women's",89.00,120.00,80,1,"Active",true,"Vanilla Musk Body Spray","Shop Vanilla Musk at The Perfume Empire.","vanilla,musk,body spray",5,,"vanilla-front.jpg;vanilla-cap.jpg",,,,"150ml",89.00,80
"Citrus Fresh Eau de Toilette","Bright citrus cologne with a clean finish.","Men's",189.00,229.00,,1,"Active",true,"Citrus Fresh Eau de Toilette","Shop Citrus Fresh at The Perfume Empire.","citrus,fresh,edt",5,,"citrus-black.jpg;citrus-box.jpg",,,"50ml",189.00,30
"Citrus Fresh Eau de Toilette","Bright citrus cologne with a clean finish.","Men's",189.00,229.00,,1,"Active",true,"Citrus Fresh Eau de Toilette","Shop Citrus Fresh at The Perfume Empire.","citrus,fresh,edt",5,,"citrus-black.jpg;citrus-box.jpg",,,"100ml",249.00,20
`;

export async function GET() {
  return new NextResponse(SAMPLE_CSV, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products-import-template.csv"',
    },
  });
}
