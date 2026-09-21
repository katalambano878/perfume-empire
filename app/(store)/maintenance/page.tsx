export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-gold-light flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-tools-line text-6xl text-brand"></i>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            We'll Be Right Back
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're currently performing scheduled maintenance to improve your shopping experience. We'll be back online shortly.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Expected Downtime</h2>
          <div className="flex items-center justify-center gap-3 text-brand">
            <i className="ri-time-line text-3xl"></i>
            <div className="text-left">
              <p className="text-sm text-gray-600">Estimated completion</p>
              <p className="text-2xl font-bold">30 minutes</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-rocket-line text-2xl text-brand"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Performance</h3>
            <p className="text-gray-600 text-sm">Faster loading times and smoother navigation</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-check-line text-2xl text-brand"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Security</h3>
            <p className="text-gray-600 text-sm">Enhanced protection for your data and transactions</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-sparkle-line text-2xl text-gold-dark"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Features</h3>
            <p className="text-gray-600 text-sm">New functionality to enhance your experience</p>
          </div>
        </div>

        <div className="bg-cream border border-cream-dark rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h3>
          <p className="text-gray-600 mb-6">
            Our customer service team is still available to help you
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:hello@theperfumeempire.com"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-200 whitespace-nowrap"
            >
              <i className="ri-mail-line"></i>
              Email Us
            </a>
            <a
              href="https://wa.me/233553967658"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors whitespace-nowrap"
            >
              <i className="ri-whatsapp-line"></i>
              WhatsApp
            </a>
            <a
              href="tel:+233553967658"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-200 whitespace-nowrap"
            >
              <i className="ri-phone-line"></i>
              Call Us
            </a>
          </div>
        </div>

        <div className="text-gray-500 text-sm">
          <p className="mb-2">Thank you for your patience</p>
          <p>Follow us on social media for real-time updates</p>
          <div className="flex gap-4 justify-center mt-4">
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <i className="ri-instagram-line text-gray-600"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
