import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // Các trang tĩnh
  const staticPages = [
    '',
    '/new-books',
    '/best-sellers',
    '/stationery',
    '/gifts',
    '/blog',
    '/shopping-guide',
    '/track-order',
    '/returns',
    '/faq',
    '/contact',
    '/about',
    '/privacy-policy',
    '/terms-of-service',
    '/shipping-policy',
    '/membership'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Các trang blog động
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const blogPages = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Trong thực tế sẽ cần add thêm dynamic routes cho Products (/products/[slug]) 
  // nhưng để tối ưu thời gian build, ta add các routes chính trước.

  return [...staticPages, ...blogPages]
}
