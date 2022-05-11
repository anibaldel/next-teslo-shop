import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
//  } from "../../utils";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest | any, ev: NextFetchEvent) {

    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // console.log({session});

    if( !session ) {
        const requestedPage = req.page.name
        return NextResponse.redirect(`/auth/login?p=${requestedPage}`);
    }
    return NextResponse.next();

    // const { token = ''} = req.cookies;

    // // return new Response('Token: '+ token)

    // try {
    //     await jwt.isValidToken( token );
    //     return NextResponse.next();
    // } catch (error) {

    //     const requestedPage = req.page.name
    //     return NextResponse.redirect(`/auth/login?p=${requestedPage}`);
        
        
    // }
}