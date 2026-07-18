export function AppFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/[0.08] mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            © 2026 Petr Piskáček
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
            <span className="hidden sm:inline">Součást AI ekosystému</span>
            <a
              href="https://petrpiskacek.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              AI Lab
            </a>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <a
              href="https://4rap.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              4rap.cz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
