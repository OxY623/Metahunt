import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '@site/src/components/Hero/Hero';
import PrologSection from '@site/src/components/PrologSection/PrologSection';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`MetaHunt & ${siteConfig.tagline}`}
      description="Prolog by ADMIN/ROOT. MMO для хакеров, тактиков и Shards."
    >
      <Hero />
      <main className={styles.main}>
        <PrologSection />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
