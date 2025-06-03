"use client";

import { useEffect, useState } from "react";
import FavoriteButton from "./FavoriteButton";

export default function FavoritesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/favorites/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.favorites.length > 0) {
        // 再查商品資訊
        const query = data.favorites.join(",");
        const productRes = await fetch(`/api/products?ids=${query}`);
        const productData = await productRes.json();
        setProducts(productData);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("載入失敗", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) return <div className="p-4">載入中...</div>;

  if (products.length === 0) return <div className="p-4">目前沒有收藏商品</div>;

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-xl p-3 shadow">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-40 object-cover rounded-lg"
          />
          <div className="mt-2 text-lg font-bold">{product.name}</div>
          <div className="text-gray-600">${product.price}</div>
          <div className="mt-2">
            <FavoriteButton productId={product.id} defaultFavorited={true} />
          </div>
        </div>
      ))}
    </div>
  );
}
