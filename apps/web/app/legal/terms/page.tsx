import { SiteHeader } from "../../../widgets/site/SiteHeader";
import { SectionHeading } from "../../../shared/ui/SectionHeading";
import { Panel } from "../../../shared/ui/Panel";

export default function TermsPage() {
  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="page-shell pt-10 space-y-6">
        <SectionHeading as="h1">Пользовательское соглашение</SectionHeading>
        <Panel className="space-y-4 text-sm leading-6">
          <p>
            Настоящее соглашение регулирует использование сервиса MetaHunt и
            является публичной офертой для пользователей на территории
            Российской Федерации.
          </p>
          <p>
            Регистрируясь в сервисе, пользователь подтверждает согласие
            соблюдать правила проекта, не нарушать права третьих лиц и
            законодательство РФ.
          </p>
          <p>
            Администрация вправе ограничить доступ или приостановить аккаунт при
            нарушении правил, а также изменять функциональность сервиса без
            предварительного уведомления.
          </p>
          <p>
            Все игровые материалы и цифровые элементы принадлежат
            правообладателю MetaHunt и не могут быть использованы без согласия.
          </p>
          <p>
            По вопросам использования сервиса пользователь может обратиться в
            службу поддержки.
          </p>
        </Panel>
      </div>
    </main>
  );
}

