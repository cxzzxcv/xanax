import ClientShell from "./components/ClientShell";

export default function Home() {
  // Static build: there's no server to read cookies, so the intro's
  // "already seen" state is resolved entirely on the client. With
  // introOptions.rememberIntroSeen === false this changes nothing; if that
  // option is ever enabled, ClientShell handles the cookie read in-browser.
  return <ClientShell hasViewedIntro={false} />;
}
