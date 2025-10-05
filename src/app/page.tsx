import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <Hero />
      <Benefits />
      <Footer />
    </div>
  )
}
