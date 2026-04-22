import { HowItWorks } from "@/components/how-it-works"
import { WidgetDemo } from "@/components/widget-demo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LogoCloud from "@/components/logo-cloud"
import { Setup } from "@/components/setup"

export default function Page() {
  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <main className="h-full w-full flex-1">
        <section className="mx-auto min-h-dvh w-full max-w-2xl">
          <section className="relative order-2 flex h-full w-full flex-col gap-8 lg:order-1">
            <header className="flex items-center gap-2 px-4 py-4 lg:px-8">
              <Button
                variant="ghost"
                asChild
                className="truncate font-mono text-sm font-semibold text-foreground opacity-50 transition-all hover:opacity-100"
              >
                <Link href="/">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M16 21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V20H16V21ZM12.3389 2.00875C12.1197 2.63186 12 3.30193 12 3.99996C12 7.31368 14.6863 9.99997 18 9.99997C18.6978 9.99997 19.3673 9.87917 19.9902 9.66013C19.9949 9.77284 20 9.8861 20 9.99997C20 11.8924 19.3426 13.6312 18.2441 15.001C17.6943 15.6866 16.3555 16.7276 16.0586 18H7.94141C7.64429 16.7274 6.30407 15.6855 5.75391 14.999C4.65647 13.6296 4 11.8914 4 9.99997C4.00003 5.58171 7.58174 1.99996 12 1.99996C12.1135 1.99996 12.2265 2.00406 12.3389 2.00875ZM17.5293 0.328316C17.7059 -0.0974697 18.2942 -0.0974816 18.4707 0.328316L18.7236 0.939645C19.1556 1.98244 19.9616 2.81516 20.9746 3.26582L21.6924 3.58516C22.1026 3.76798 22.1026 4.36518 21.6924 4.54805L20.9326 4.88594C19.9449 5.32522 19.1534 6.12845 18.7139 7.13692L18.4668 7.70235C18.2864 8.11648 17.7137 8.11648 17.5332 7.70235L17.2871 7.13692C16.8476 6.12829 16.0552 5.32527 15.0674 4.88594L14.3076 4.54805C13.8974 4.36519 13.8974 3.76797 14.3076 3.58516L15.0254 3.26582C16.0385 2.81516 16.8445 1.98245 17.2764 0.939645L17.5293 0.328316Z"></path>
                  </svg>{" "}
                  Screen2Prompt
                </Link>
              </Button>

              <nav className="ml-auto hidden items-center gap-1 sm:flex">
                <Link
                  href="#how-it-works"
                  className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  How it works
                </Link>
                <Link
                  href="#setup"
                  className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Setup
                </Link>
                <a
                  href="https://github.com/crafter-station/screen2prompt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Open source
                </a>
              </nav>
            </header>

            <section className="flex flex-col gap-8 px-8 lg:px-8">
              <section className="flex flex-col gap-4">
                <h1 className="max-w-md text-3xl leading-snug font-medium text-balance">
                  Visual Prompt Generation for{" "}
                  <span className="text-brand">Agents</span>.
                </h1>

                <p className="group w-full text-base text-balance text-muted-foreground">
                  Create and tweak screens{" "}
                  <span className="font-semibold transition-colors duration-75 group-hover:text-brand">
                    2x faster
                  </span>{" "}
                  in{" "}
                  <span className="font-semibold transition-colors duration-75 group-hover:text-brand">
                    Claude Code
                  </span>
                  ,{" "}
                  <span className="font-semibold transition-colors duration-75 group-hover:text-brand">
                    Cursor
                  </span>
                  ,{" "}
                  <span className="font-semibold transition-colors duration-75 group-hover:text-brand">
                    Codex
                  </span>
                  , or any other{" "}
                  <span className="font-semibold transition-colors duration-75 group-hover:text-brand">
                    AI tool
                  </span>{" "}
                  using <span className="font-semibold">Screen2Prompt</span>.
                  {/* <span className="font-semibold">Screen2Prompt</span> converts
                  UI feedback into structured markdown that AI coding agents can
                  act on precisely. Click any element, annotate it, drag
                  wireframe components, or sketch a new screen — then paste the
                  output into <span className="font-semibold">Claude Code</span>
                  , <span className="font-semibold">Codex</span>, or{" "}
                  <span className="font-semibold">any AI</span> tool. */}
                </p>
              </section>

              <section className="w-full">
                <LogoCloud />
              </section>

              {/* video demo */}
              <section className="relative aspect-video w-full overflow-hidden rounded-lg border border-input bg-card">
                <iframe
                  src="https://www.youtube.com/embed/hk5ozzgD3mY"
                  title="Screen2Prompt Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </section>
            </section>

            <section
              id="how-it-works"
              className="relative w-full overflow-hidden px-8 pb-16 lg:px-8"
            >
              <HowItWorks />
            </section>

            {/* Setup */}
            <section
              id="setup"
              className="relative w-full overflow-hidden px-8 pb-16 lg:px-8"
            >
              <Setup />
            </section>
          </section>
        </section>
      </main>

      <footer className="w-full border-t border-input px-8 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Screen2Prompt · A product by{" "}
        <a
          href="https://supalab.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/70 underline-offset-2 hover:underline"
        >
          Supalab Dev
        </a>
      </footer>

      <WidgetDemo />
    </section>
  )
}
