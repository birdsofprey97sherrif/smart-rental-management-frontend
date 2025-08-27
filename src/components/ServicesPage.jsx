export default function ServicesPage() {
  const services = [
    {
      title: "🏡 Tenant Dashboard",
      desc: "View payment history, request relocations, and manage agreements seamlessly.",
    },
    {
      title: "🧑‍💼 Landlord Tools",
      desc: "Upload houses, assign caretakers, monitor tenant activity, and track payments.",
    },
    {
      title: "🧹 Caretaker Portal",
      desc: "View assigned properties, approve relocation visits, and chat with tenants.",
    },
    {
      title: "📩 Notifications",
      desc: "Real-time SMS, email, and in-app updates for events and messages.",
    },
  ];

  return (
    <div className="mt-20 px-6 py-10 max-w-6xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-8">Our Services</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((srv, i) => (
          <div key={i} className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{srv.title}</h3>
            <p className="text-gray-600">{srv.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
