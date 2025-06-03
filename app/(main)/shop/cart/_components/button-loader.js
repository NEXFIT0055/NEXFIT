"use client";

import styles from "./button-loader.module.css";

// https://css-loaders.com/spinner/
export default function ButtonLoader() {
  return (
    <>
      <div className={styles.loader}></div>
    </>
  );
}
