"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "./SocketProvider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <SocketProvider>{children}</SocketProvider>
    </SessionProvider>
  );
}
