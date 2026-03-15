import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title:'Выбери сторону силы',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Присоединись к одной из фракций. Каждая (Wolf/OXY, Fox, Bear, Owl) уникальна, имеет свой игровой интерфейс: UI, 
        доступ к терминалам и механику взаимодействия.
      </>
    ),
  },
  {
    title:'Shards основа обмена',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Экономика на базе <code>Shards</code> объединяет хакеров, торговцев, наемников и дилеров. Стань лучшим в 
        касте Bear. Торгуй в кибер-притонах и сражайся в секторах Wolf и Owl.
      </>
    ),
  },
  {
    title: 'Стек для профи',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
     <>
        Бэкенд на <code>FastAPI</code> + <code>PostgreSQL</code>, фронтенд на <code>Next.js 16</code> и облачные сервисы. 
        Построено на Turborepo. Мы ценим мощь.
      </>
    ),
  },
];

function Feature({title, Svg, description}: (typeof FeatureList)[number]) {
  return (
    <div className={clsx('col col--4', styles.card)}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
