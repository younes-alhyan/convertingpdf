import { Helmet } from "react-helmet-async";

export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  robots?: string;
  structuredData?: object;
}

const seoMetadataMap: Record<string, SeoMetadata> = {
  home: {
    title: "convertingpdf - Free Online PDF Converter & Processing Tools",
    description:
      "Convert, compress, merge, and split PDF files for free with convertingpdf. Fast, secure, and easy-to-use PDF tools available online.",
    keywords:
      "PDF converter, PDF tools, convert PDF, compress PDF, merge PDF, split PDF, free PDF tools",
    canonical: "https://convertingpdf.lovable.app/",
    ogTitle: "convertingpdf - Free PDF Tools",
    ogDescription:
      "Professional PDF processing tools - Convert, compress, merge and split PDFs online for free.",
    ogType: "website",
    twitterTitle: "convertingpdf - Free PDF Tools",
    twitterDescription:
      "Convert and process PDF files online for free with professional-grade tools.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "convertingpdf",
      description: "Free online PDF converter and processing tools",
      url: "https://convertingpdf.lovable.app",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  about: {
    title: "About convertingpdf - Professional PDF Processing Platform",
    description:
      "Learn about convertingpdf, the professional PDF processing platform trusted by users worldwide. Discover our mission to simplify document management.",
    keywords:
      "about convertingpdf, PDF platform, document management, PDF tools company",
    canonical: "https://convertingpdf.lovable.app/about",
    ogTitle: "About convertingpdf - Our Story & Mission",
    ogDescription:
      "Learn about convertingpdf and our mission to provide professional PDF tools for everyone.",
    ogType: "website",
    twitterTitle: "About convertingpdf",
    twitterDescription:
      "Discover the story behind convertingpdf and our commitment to excellent PDF tools.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About convertingpdf",
      description:
        "Learn about convertingpdf, the professional PDF processing platform",
      mainEntity: {
        "@type": "Organization",
        name: "convertingpdf",
        description: "Professional PDF processing tools for everyone",
        url: "https://convertingpdf.lovable.app",
      },
    },
  },
  contact: {
    title: "Contact convertingpdf - Get Help & Support",
    description:
      "Contact convertingpdf for support, questions, or feedback. We're here to help with all your PDF processing needs.",
    keywords:
      "contact convertingpdf, PDF support, customer service, help, feedback",
    canonical: "https://convertingpdf.lovable.app/contact",
    ogTitle: "Contact convertingpdf",
    ogDescription: "Get in touch with convertingpdf for support and inquiries.",
    ogType: "website",
    twitterTitle: "Contact convertingpdf",
    twitterDescription:
      "Reach out to our support team for help with PDF tools.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact convertingpdf",
      description: "Contact page for convertingpdf support and inquiries",
    },
  },
  dashboard: {
    title: "Dashboard - convertingpdf PDF Tools",
    description:
      "Access your convertingpdf dashboard. Manage your PDF documents, view processing history, and access all PDF tools in one place.",
    canonical: "https://convertingpdf.lovable.app/dashboard",
    robots: "noindex, nofollow",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "convertingpdf Dashboard",
      description:
        "User dashboard for managing PDF documents and accessing tools",
    },
  },
  notFound: {
    title: "404 - Page Not Found | convertingpdf",
    description:
      "The page you're looking for doesn't exist. Return to convertingpdf to access our PDF processing tools.",
    canonical: "https://convertingpdf.lovable.app",
    robots: "noindex, nofollow",
  },
  tools: {
    title: "All PDF Tools - Convert, Edit, Merge & Optimize | convertingpdf",
    description:
      "Explore all free PDF tools offered by convertingpdf. Convert, merge, split, compress, edit, and optimize your PDF documents easily in one place.",
    keywords:
      "PDF tools, online PDF tools, free PDF tools, PDF converter, PDF editor, merge PDF, split PDF, compress PDF, edit PDF",
    canonical: "https://convertingpdf.lovable.app/tools/",
    ogTitle: "All PDF Tools - convertingpdf",
    ogDescription:
      "Access the full suite of PDF tools: convert, compress, merge, split, and edit your PDF files for free.",
    ogType: "website",
    twitterTitle: "All PDF Tools - convertingpdf",
    twitterDescription:
      "Discover all available PDF tools to convert, edit, merge, split, and optimize PDF files online for free.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "All PDF Tools",
      description:
        "Collection of all free PDF processing tools from convertingpdf",
      url: "https://convertingpdf.lovable.app/tools/",
      isPartOf: {
        "@type": "WebSite",
        name: "convertingpdf",
        url: "https://convertingpdf.lovable.app",
      },
      about: {
        "@type": "Thing",
        name: "PDF Tools",
      },
      hasPart: [
        {
          "@type": "WebApplication",
          name: "Merge PDF",
          url: "https://convertingpdf.lovable.app/tools/merge",
          applicationCategory: "Utility",
        },
        {
          "@type": "WebApplication",
          name: "Split PDF",
          url: "https://convertingpdf.lovable.app/tools/split",
          applicationCategory: "Utility",
        },
        {
          "@type": "WebApplication",
          name: "Compress PDF",
          url: "https://convertingpdf.lovable.app/tools/compress",
          applicationCategory: "Utility",
        },
        {
          "@type": "WebApplication",
          name: "PDF to Word",
          url: "https://convertingpdf.lovable.app/tools/pdf-to-word",
          applicationCategory: "Utility",
        },
        {
          "@type": "WebApplication",
          name: "PDF to JPG",
          url: "https://convertingpdf.lovable.app/tools/pdf-to-jpg",
          applicationCategory: "Utility",
        },
        {
          "@type": "WebApplication",
          name: "Edit PDF",
          url: "https://convertingpdf.lovable.app/tools/edit",
          applicationCategory: "Utility",
        },
      ],
    },
  },
  compress: {
    title: "Compress PDF - Reduce PDF File Size Online Free | convertingpdf",
    description:
      "Compress PDF files online for free. Reduce PDF file size without losing quality. Fast, secure PDF compression tool with no watermarks.",
    keywords:
      "compress PDF, reduce PDF size, PDF compressor, shrink PDF, optimize PDF, PDF file size reducer",
    canonical: "https://convertingpdf.lovable.app/compress",
    ogTitle: "Compress PDF - Free Online PDF Compression",
    ogDescription:
      "Reduce PDF file size online for free. Compress PDFs without quality loss.",
    ogType: "website",
    twitterTitle: "Compress PDF Files Online Free",
    twitterDescription:
      "Reduce PDF file size without losing quality. Fast and secure compression.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF Compressor",
      description:
        "Compress PDF files online to reduce file size without quality loss",
      url: "https://convertingpdf.lovable.app/compress",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  edit: {
    title: "Edit PDF Online Free - PDF Editor | convertingpdf",
    description:
      "Edit PDF files online for free. Add text, images, annotations, and signatures to your PDFs. Professional PDF editing tool with no software installation required.",
    keywords:
      "edit PDF, PDF editor, online PDF editor, modify PDF, PDF annotation, add text to PDF",
    canonical: "https://convertingpdf.lovable.app/edit",
    ogTitle: "Edit PDF Online - Free PDF Editor",
    ogDescription:
      "Edit PDFs online for free. Add text, images, and annotations to your documents.",
    ogType: "website",
    twitterTitle: "Edit PDF Files Online Free",
    twitterDescription:
      "Professional PDF editing tool. Add text, images, and more to your PDFs.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF Editor",
      description: "Edit PDF files online - add text, images, and annotations",
      url: "https://convertingpdf.lovable.app/edit",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  merge: {
    title: "Merge PDF Files Online Free - Combine PDFs | convertingpdf",
    description:
      "Merge PDF files online for free. Combine multiple PDFs into one document quickly and securely. No file size limits or watermarks.",
    keywords:
      "merge PDF, combine PDF, join PDF, PDF merger, merge multiple PDFs, combine PDF files",
    canonical: "https://convertingpdf.lovable.app/merge",
    ogTitle: "Merge PDF Files - Free PDF Combiner",
    ogDescription:
      "Combine multiple PDF files into one document. Fast, secure, and free.",
    ogType: "website",
    twitterTitle: "Merge PDF Files Online Free",
    twitterDescription:
      "Combine multiple PDFs into one document quickly and securely.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF Merger",
      description: "Merge multiple PDF files into one document online",
      url: "https://convertingpdf.lovable.app/merge",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  pdfToJpg: {
    title:
      "PDF to JPG Converter Online Free - Convert PDF to Image | convertingpdf",
    description:
      "Convert PDF to JPG online for free. Transform PDF pages into high-quality JPG images. Fast, secure PDF to image conversion with no quality loss.",
    keywords:
      "PDF to JPG, PDF to image, convert PDF to JPG, PDF to JPEG, PDF image converter",
    canonical: "https://convertingpdf.lovable.app/pdf-to-jpg",
    ogTitle: "PDF to JPG Converter - Free Online Tool",
    ogDescription:
      "Convert PDF to JPG images online. High-quality conversion, fast and secure.",
    ogType: "website",
    twitterTitle: "Convert PDF to JPG Online Free",
    twitterDescription:
      "Transform PDF pages into high-quality JPG images instantly.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF to JPG Converter",
      description: "Convert PDF files to JPG images online",
      url: "https://convertingpdf.lovable.app/pdf-to-jpg",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  pdfToWord: {
    title:
      "PDF to Word Converter Online Free - Convert PDF to DOCX | convertingpdf",
    description:
      "Convert PDF to Word online for free. Transform PDFs to editable DOCX documents. Fast, accurate PDF to Word conversion with preserved formatting.",
    keywords:
      "PDF to Word, PDF to DOCX, convert PDF to Word, PDF converter, PDF to doc",
    canonical: "https://convertingpdf.lovable.app/pdf-to-word",
    ogTitle: "PDF to Word Converter - Free Online Tool",
    ogDescription:
      "Convert PDF to editable Word documents. Fast and accurate conversion.",
    ogType: "website",
    twitterTitle: "Convert PDF to Word Online Free",
    twitterDescription:
      "Transform PDF files into editable Word documents with preserved formatting.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF to Word Converter",
      description: "Convert PDF files to editable Word documents online",
      url: "https://convertingpdf.lovable.app/pdf-to-word",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  split: {
    title: "Split PDF Online Free - Extract PDF Pages | convertingpdf",
    description:
      "Split PDF files online for free. Extract pages from PDF documents, separate PDFs into multiple files. Fast, secure PDF splitting tool.",
    keywords:
      "split PDF, extract PDF pages, divide PDF, separate PDF, PDF splitter",
    canonical: "https://convertingpdf.lovable.app/split",
    ogTitle: "Split PDF - Free PDF Splitter Tool",
    ogDescription:
      "Extract pages from PDF files. Split PDFs into multiple documents quickly.",
    ogType: "website",
    twitterTitle: "Split PDF Files Online Free",
    twitterDescription:
      "Extract and separate PDF pages into multiple files instantly.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF Splitter",
      description: "Split PDF files and extract pages online",
      url: "https://convertingpdf.lovable.app/split",
      applicationCategory: "UtilitiesApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
};

export const useSeo = (page: keyof typeof seoMetadataMap) => {
  const metadata = seoMetadataMap[page];

  const SeoHelmet = () => (
    <Helmet>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && (
        <meta name="keywords" content={metadata.keywords} />
      )}
      {metadata.robots && <meta name="robots" content={metadata.robots} />}
      <link rel="canonical" href={metadata.canonical} />

      {/* Open Graph */}
      {metadata.ogTitle && (
        <meta property="og:title" content={metadata.ogTitle} />
      )}
      {metadata.ogDescription && (
        <meta property="og:description" content={metadata.ogDescription} />
      )}
      {metadata.ogType && <meta property="og:type" content={metadata.ogType} />}
      <meta property="og:url" content={metadata.canonical} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {metadata.twitterTitle && (
        <meta name="twitter:title" content={metadata.twitterTitle} />
      )}
      {metadata.twitterDescription && (
        <meta
          name="twitter:description"
          content={metadata.twitterDescription}
        />
      )}

      {/* Structured Data */}
      {metadata.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(metadata.structuredData)}
        </script>
      )}
    </Helmet>
  );

  return { metadata, SeoHelmet };
};
