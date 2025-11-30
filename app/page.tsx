import { getFeaturedProducts } from "@/app/admin/featuredActions";
import HomeClient from "@/components/HomeClient";

export const revalidate = 10;

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return <HomeClient featuredProducts={featuredProducts} />;
}
