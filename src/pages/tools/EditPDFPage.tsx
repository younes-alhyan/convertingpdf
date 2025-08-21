import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditPDF from "@/components/tools/EditPDF";

const EditPDFPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24">
        <div className="container px-4">
          <EditPDF />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditPDFPage;