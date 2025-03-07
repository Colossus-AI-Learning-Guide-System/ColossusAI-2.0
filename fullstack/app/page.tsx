import { SettingsButton } from "@/app/components/ui/settings-button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">My App</h1>
        <SettingsButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Welcome to the App</h2>
          <p className="mb-8 text-gray-300">Click the settings icon in the top right to open the settings panel</p>
        </div>
      </main>
    </div>
  )
}

