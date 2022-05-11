import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { dbUsers } from "../../../database";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Credentials({
        name: 'Custom login',
        credentials: {
            email: { label: 'Correo:', type: 'email', placeholder: 'correo@google.com' },
            password: { label: 'Contraseña:', type: 'password', placeholder: 'Contraseña' },

        },
        async authorize(credentials) {
            console.log({credentials})
            // return { name: 'Anibal', correo:'anibal@google.com', role: 'admin'};
            return await dbUsers.checkEmailPassword(credentials!.email, credentials!.password);
        }
    }),

    GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
      // ...add more providers here
  ],

  // Custom Pages
  pages: {
      signIn: '/auth/login',
      newUser: '/auth/register'
  },

  // Callbacks
  jwt : {

  },

  session: {
      maxAge: 2592000, /// 30d
      strategy: 'jwt',
      updateAge: 864000 // cada dia
  },
  callbacks: {
      async jwt({ token, account, user }) {
        // console.log({ token, account, user })
        if( account ) {
            token.accessToken = account.access_token;

            switch (account.type) {
                case 'oauth':
                    token.user = await dbUsers.oAuthToDbUser( user?.email || '', user?.name || '');
                break;
                case 'credentials':
                    token.user = user;
                break;
            
                default:
                    break;
            }
        }

        return token;
      },
      async session({ session, token, user }) {
        // console.log({ session, token, user })
        session.accessToken = token.accessToken;
        session.user = token.user as any;
        return session;
      }

  }
})