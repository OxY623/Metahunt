import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import MetaHuntLogo from '../MetaHuntLogo/MetaHuntLogo';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};


const FeatureList: FeatureItem[] = [
  {
    title: 'Выбери фракцию',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Четыре фракции — четыре стиля игры. Волк, Лиса, Медведь или Сова.
        Каждый выбор меняет интерфейс, скиллы и врагов. Выбор необратим.
      </>
    ),
  },
  {
    title: 'Осколки решают всё',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Внутренняя валюта <code>Shards</code> управляет скиллами, банами и
        анонимностью. Медведь берёт налог. Сова продаёт секреты. Лиса получает
        откат. Волк просто злится.
      </>
    ),
  },
  {
    title: 'FastAPI + Next.js',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Бэкенд на <code>FastAPI</code> + <code>PostgreSQL</code>, фронт на{' '}
        <code>Next.js</code> в пиксельном киберпанк стиле. Монорепо на
        Turborepo. Задокументировано здесь.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
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
