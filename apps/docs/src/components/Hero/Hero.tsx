import clsx from "clsx";
import Link from "@docusaurus/Link";
import MetaHuntLogo from "../MetaHuntLogo/MetaHuntLogo";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.blurA} />
      <div className={styles.blurB} />
      <div className="container">
        <div className={styles.content}>
          {/* Было: PROLOG  ADMIN */}
          <div className={styles.badge}>PROLOG & ADMIN</div>
          <MetaHuntLogo />
          <h1 className={styles.title}>MetaHunt</h1>
          <p className={styles.subtitle}>
            Асинхронная MMO для хакеров, тактиков и адептов теневых сетей. Твое
            погружение в мир киберпанка и тайных орденов.
          </p>
          <div className={styles.actions}>
            <Link className="button button--secondary button--lg" to="/docs/">
              Читать Prolog
            </Link>
            <Link
              className={clsx(
                "button button--primary button--lg",
                styles.primary,
              )}
              to="/docs/concept/overview"
            >
              О концепте
            </Link>
          </div>
          <div className={styles.meta}>
            <span>Shards economy</span>
            {/* Было: 4   1  */}
            <span>4 фракции и 1 город</span>
            <span>FastAPI + Next.js 16</span>
          </div>
        </div>
      </div>
    </section>
  );
}
