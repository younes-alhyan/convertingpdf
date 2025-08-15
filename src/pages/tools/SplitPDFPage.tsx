import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SplitPDF from "@/components/tools/SplitPDF";

const SplitPDFPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24">
        <div className="container px-4">
          <SplitPDF />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SplitPDFPage;