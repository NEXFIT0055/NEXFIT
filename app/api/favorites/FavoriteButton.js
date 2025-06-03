"use client";
import { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

export default function FavoriteButton({ productId, defaultFavorited }) {
  const [liked, setLiked] = useState(defaultFavorited);

  const toggleFavorite = async () => {
    const method = liked ? "DELETE" : "POST";
    await fetch("/api/favorites/products", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"), // 請視你驗證方式調整
      },
      body: JSON.stringify({ productId }),
    });
    setLiked(!liked);
  };

  return (
    <button onClick={toggleFavorite}>
      {liked ? <AiFillHeart color="red" /> : <AiOutlineHeart />}
    </button>
  );
}
