import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>My ThreeJs World</title>
        <meta name="description" content="A Simple 3d sandbox world" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Link href="/game">Go to GAME Page</Link>
        <br />
        <Link href="/about">Go to ABOUT Page</Link>
      </main>
    </>
  );
}
