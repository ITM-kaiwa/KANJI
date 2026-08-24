import { APP_VERSION } from "@/lib/version.generated";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-sand-300/60 py-4 text-center text-xs text-sand-600">
      © 2026 ITM Group All Rights Reserved, KANJI Ver{APP_VERSION}
    </footer>
  );
}
