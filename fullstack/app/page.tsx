import { SettingsPanel } from "./components/settings-panel"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-4 text-2xl font-bold">Settings Panel Demo</h1>
      <SettingsPanel />
    </main>
  )
}

