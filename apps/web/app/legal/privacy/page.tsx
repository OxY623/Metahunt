import { SiteHeader } from "../../../widgets/site/SiteHeader";
import { SectionHeading } from "../../../shared/ui/SectionHeading";
import { Panel } from "../../../shared/ui/Panel";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="page-shell pt-10 space-y-6">
        <SectionHeading as="h1">Защита персональных данных</SectionHeading>
        <Panel className="space-y-4 text-sm leading-6">
          <p>
            Настоящий документ определяет порядок обработки и защиты
            персональных данных пользователей MetaHunt в соответствии с
            законодательством Российской Федерации.
          </p>
          <p>
            Мы собираем только те данные, которые необходимы для регистрации,
            доступа к игровым функциям и обеспечения безопасности сервиса.
          </p>
          <p>
            Обрабатываемые категории данных: email, никнейм, технические
            идентификаторы сессии и данные игрового профиля.
          </p>
          <p>
            Пользователь вправе запросить удаление данных и ограничение
            обработки, направив запрос в службу поддержки.
          </p>
          <p>
            Данные хранятся на защищённых серверах, доступ к ним ограничен и
            контролируется.
          </p>
        </Panel>
      </div>
    </main>
  );
}

