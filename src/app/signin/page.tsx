import React, { Suspense } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar/Navbar";
import Form from "@/components/Form/Form";
import Link from "next/link";

export default function Signin() {
  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.topbar}>
          <Image
            src="/image/logo-light.png"
            alt="logo"
            width={80}
            height={60}
          />
          <div>
            <h3 className="font-strong">Welcome back!</h3>
            <p>Sign in to use your account</p>
          </div>
        </div>
        <Form purpose="signin" />
        <div className={styles.guide_to_signup}>
          <Link href="/signup">Don&apos;t have an account? Sign up</Link>
        </div>
      </div>
    </main>
  );
}
