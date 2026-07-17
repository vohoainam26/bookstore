"use client";
import { useState } from "react";
import { ContentPageLayout } from "@/components/content/content-page-layout";
import { faqContent } from "@/lib/content/policies";
import { CaretDown } from "@phosphor-icons/react";
import Link from "next/link";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <ContentPageLayout
      title="Câu hỏi thường gặp"
      description="Giải đáp các thắc mắc phổ biến về việc mua sắm, thanh toán và giao nhận tại Trang Sách."
      breadcrumbs={[{ label: "Câu hỏi thường gặp", href: "/faq" }]}
    >
      <div className="space-y-10">
        {faqContent.map((cat, catIdx) => (
          <div key={catIdx}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">{cat.category}</h2>
            <div className="space-y-4">
              {cat.questions.map((q, qIdx) => {
                const id = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === id;
                return (
                  <div key={qIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-300">
                    <button
                      onClick={() => toggle(id)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-semibold text-gray-900">{q.q}</span>
                      <CaretDown 
                        size={20} 
                        weight="bold" 
                        className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-red-500" : ""}`} 
                      />
                    </button>
                    
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <p className="text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                        {q.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-gray-50 rounded-2xl text-center border border-gray-100">
        <h4 className="text-lg font-bold text-gray-900 mb-3">Bạn vẫn còn thắc mắc?</h4>
        <p className="text-gray-600 mb-6">Đừng ngần ngại liên hệ với chúng tôi để được giải đáp tận tình nhất.</p>
        <Link href="/contact" className="inline-block px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
          Liên hệ ngay
        </Link>
      </div>
    </ContentPageLayout>
  );
}
