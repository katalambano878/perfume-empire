'use client';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'Bottles' }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const sizeGuides: Record<string, { measurements: string[]; sizes: Record<string, string>[] }> = {
    Bottles: {
      measurements: ['Volume', 'Typical', 'Travel'],
      sizes: [
        { size: '15ml', volume: '15ml', typical: 'Purse / pocket', travel: 'Yes' },
        { size: '30ml', volume: '30ml', typical: 'Daily trial', travel: 'Yes' },
        { size: '50ml', volume: '50ml', typical: 'Everyday wear', travel: 'Check airline' },
        { size: '100ml', volume: '100ml', typical: 'Full bottle', travel: 'Checked bag' },
      ]
    },
    Oils: {
      measurements: ['Volume', 'Typical', 'Travel'],
      sizes: [
        { size: '3ml', volume: '3ml', typical: 'Sample', travel: 'Yes' },
        { size: '6ml', volume: '6ml', typical: 'Personal', travel: 'Yes' },
        { size: '12ml', volume: '12ml', typical: 'Regular use', travel: 'Yes' },
      ]
    },
  };

  const guide = sizeGuides[category] || sizeGuides.Bottles;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-4xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Size Guide: {category}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-2xl text-gray-700"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="bg-cream border border-cream-dark rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="w-6 h-6 flex items-center justify-center mr-3">
                  <i className="ri-information-line text-xl text-brand"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">How to choose a size</h3>
                  <ul className="text-sm text-brand space-y-1">
                    <li>• Start with 15ml or 30ml if you are trying a new scent</li>
                    <li>• 50ml is the everyday bottle for most customers</li>
                    <li>• 100ml is best value if you already know the fragrance</li>
                    <li>• Oils are concentrated — a few drops last a long time</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                    {guide.measurements.map((measurement: string) => (
                      <th key={measurement} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.sizes.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                      {guide.measurements.map((measurement: string) => {
                        const key = measurement.toLowerCase().replace(/\s+/g, '');
                        return (
                          <td key={measurement} className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                            {row[key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <i className="ri-drop-line text-brand"></i>
                  </div>
                  Application tips
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Spray on pulse points: wrists, neck, behind ears</li>
                  <li>• Do not rub spray perfume into the skin</li>
                  <li>• Oils: apply a drop and let it warm on skin</li>
                  <li>• Store bottles upright, away from heat and sun</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <i className="ri-question-line text-brand"></i>
                  </div>
                  Need help?
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Ask in store at East Legon, near America House</li>
                  <li>• Check the product page for concentration</li>
                  <li>• Read customer reviews for longevity notes</li>
                  <li>• Call or WhatsApp 055 396 7658</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Still not sure which size to buy? Our team can help you choose.
              </p>
              <button className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
