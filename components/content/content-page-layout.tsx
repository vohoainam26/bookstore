import React from 'react';
import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';

export function ContentPageLayout({
  title,
  description,
  breadcrumbs,
  lastUpdated,
  children
}: {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href: string }[];
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-[850px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <CaretRight size={12} weight="bold" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{b.label}</span>
                ) : (
                  <Link href={b.href} className="hover:text-red-600 transition-colors">{b.label}</Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          
          {description && (
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              {description}
            </p>
          )}

          {lastUpdated && (
            <p className="text-sm text-gray-400 italic">
              Cập nhật lần cuối: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[850px] mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-red-600 hover:prose-a:text-red-700">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
