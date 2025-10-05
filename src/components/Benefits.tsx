export default function Benefits() {
  const benefits = [
    {
      title: "Reduce operational costs by up to 60%",
      description: "Switch from expensive fuel generators to cost-effective solar and storage solutions.",
      icon: "💰",
    },
    {
      title: "Cut carbon emissions by up to 75%",
      description: "Significantly reduce your environmental footprint with clean energy alternatives.",
      icon: "🌱",
    },
    {
      title: "Plan optimal solar + storage capacity",
      description: "Get precise recommendations for your specific energy needs and location.",
      icon: "⚡",
    },
  ]

  return (
    <section className="py-20 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
            Why Choose ACEP?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your remote operations with intelligent energy planning
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-8 hover:scale-[1.02] hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-500/30"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
