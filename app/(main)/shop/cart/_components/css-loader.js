"use client";

import styles from "./css-loader.module.css";

// https://css-loaders.com/spinner/
export default function CssLoader() {
  return (
    <>
      <div className={styles.loader}></div>
    </>
  );
}
