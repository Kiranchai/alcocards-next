import CartComponent from "@/app/components/CartComponent/CartComponent";
import React from "react";
import styles from "./page.module.css";

export default function Cart() {
  return (
    <section className={`mh ${styles.cart_section}`}>
      <div className={styles.cart_main}>
        <h1 className={styles.cart_header}>Mój koszyk</h1>

        <CartComponent />
      </div>
    </section>
  );
}
