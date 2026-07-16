"use server";

import { supabase } from "./supabase";

export interface Book {
  id: string;
  source_id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number;
  discount_percent: number;
  description_html: string | null;
  image_url: string;
  source_url: string;
  label: string | null;
  episode: string | null;
  stock_status: string | null;
  reviews_count: number;
  rating_value: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export async function getBooks(
  page: number = 1,
  limit: number = 24,
  options?: {
    category?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
  }
) {
  let query = supabase.from("books").select("*", { count: "exact" }).not("image_url", "like", "%ring_loader.svg%");

  if (options) {
    if (options.category && options.category.length > 0) {
      query = query.in("category", options.category);
    }
    if (options.minPrice !== undefined) {
      query = query.gte("price", options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      query = query.lte("price", options.maxPrice);
    }
    if (options.minRating !== undefined && options.minRating > 0) {
      query = query.gte("rating_value", options.minRating);
    }

    switch (options.sortBy) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_value", { ascending: false });
        break;
      case "bestseller":
        query = query.order("reviews_count", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching books:", error);
    return { books: [], total: 0 };
  }

  return { books: data as Book[], total: count || 0 };
}

export async function getBookBySlug(slug: string) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching book by slug:", error);
    return null;
  }

  return data as Book;
}
