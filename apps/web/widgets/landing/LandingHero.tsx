import AdminProtocolHero from "../foxy/AdminProtocolHero";

type Props = {
  className?: string;
};

export function LandingHero({ className }: Props) {
  return (
    <div className={className}>
      <AdminProtocolHero />
    </div>
  );
}
