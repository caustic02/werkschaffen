import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Werk from "@/components/Werk";
import Schaffen from "@/components/Schaffen";
import Kritik from "@/components/Kritik";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Manifesto />
      <Werk />
      <Schaffen />
      <Kritik />
      <Contact />
      <Footer />
      <AdminPanel />
    </>
  );
}
