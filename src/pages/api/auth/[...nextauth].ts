// O caminho para esse arquivo e o nome do arquivo precisam ser exatamente como está. Aqui iremos chamar o meio no qual queremos que seja a nossa autentificacao. pode ser mais de um

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],
    secret: process.env.JWT_SECRET as string,
}

export default NextAuth(authOptions);