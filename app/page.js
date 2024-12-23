"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let localPathname = localStorage.getItem("pathname");

    if (pathname === "/") {
      if (localPathname) {
        router.push(localPathname);
      } else {
        router.push("/login");
      }
    } else {
      window.location.href = "/";
    }
  }, [pathname, router]);

  return null;
}
