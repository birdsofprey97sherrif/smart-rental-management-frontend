export default function AboutPage() {
  return (
    <div className="mt-20 px-6 py-10 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">About Smart Rentals</h1>
      <p className="text-lg text-gray-600 leading-relaxed">
        Smart Rentals is a modern digital rental management platform tailored for landlords, tenants,
        and caretakers. Our mission is to eliminate paperwork, simplify relocation requests,
        and automate rent collection — while keeping everyone informed in real-time.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold mb-2">🔒 Secure</h3>
          <p>We use secure technology to protect your data and rent transactions.</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold mb-2">📱 Mobile-Friendly</h3>
          <p>Manage your rentals anytime, anywhere with mobile-responsive dashboards.</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold mb-2">🚀 Fast & Reliable</h3>
          <p>Lightning-fast dashboards and notifications that keep you in control.</p>
        </div>
      </div>
    </div>
  );
}
