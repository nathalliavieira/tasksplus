import { Header } from "@/components/header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react" //O sessionProvider nada mais é do que uma extensao de autentificacao (de fazer login). Muito utilizada pois disponibiliza vários métodos de autentificacao diferentes (instagram, gitHub, google, Facebook...) 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}> {/* lembre sempre que o session precisa revestir todo o nosso App e também precisamos passar uma session, que temos no pageProps fornecido pelo nextJs */}
      <Header/>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
