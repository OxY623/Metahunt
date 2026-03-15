import styles from './PrologSection.module.css';

const rules = [
  {
    title: 'Твое тело изменится',
    text: 'Кибернетика поглотит плоть. Каждое внедрение важно, но ограничено ресурсами и тем, что разум может выдержать в сумме.'
  },
  {
    title: 'Shards как валюта',
    text: 'Данные, зашифрованные в специальных носителях Shards. Торгуй с осторожностью; они используются в терминалах повсюду.'
  },
  {
    title: 'ADMIN в тени сетей',
    text: 'Прямая имитация власти. Полный доступ имеет только ROOT. Будьте готовы противостоять кибер-захватам.'
  }
];

export default function PrologSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <p className={styles.kicker}>Prolog</p>
            <h2>Добро пожаловать в систему ADMIN</h2>
            <p className={styles.lead}>
              Выберите свой путь, как сделали многие. Каждая каста уникальна в способе выжить, будь выбор ваш: Wolf/OXY, Fox, Bear или Owl.
            </p>
          </div>
          <div className={styles.grid}>
            {rules.map((rule) => (
              <div key={rule.title} className={styles.card}>
                <div className={styles.cardTitle}>{rule.title}</div>
                <p>{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}