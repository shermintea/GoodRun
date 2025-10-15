/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      app/api/auth/[...nextauth]/route.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      09-10-2025
*Version:   1.0
*Purpose:   Core API route that NextAuth uses to handle all authentication requests.
*           Connects frontend pages to the backend authentication logic (defined in lib/auth.ts)
*Revisions:
*v1.0 - 09-10-2025 - Initial implementation
*******************************************************/

import NextAuth from "next-auth";
import { authOptions } from "@/lib/utils/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
