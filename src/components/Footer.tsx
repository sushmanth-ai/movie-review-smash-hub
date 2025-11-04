import { Mail, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
  const whatsappNumber = "919014568368";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const emailAddress = "sushmanth1106@gmail.com";

  return (
    <footer className="bg-slate-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold">Phone</span>
            </div>
            <a
              href="tel:+919014568368"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              +91 9014568368
            </a>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold">Email</span>
            </div>
            <a
              href={`mailto:${emailAddress}`}
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              {emailAddress}
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold">WhatsApp</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Chat with us
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400">
          <p>&copy; 2024 Movie Review Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
