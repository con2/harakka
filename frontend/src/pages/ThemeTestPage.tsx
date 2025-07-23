import { OrganizationThemeSwitcher } from "@/components/theme/OrganizationThemeSwitcher";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <OrganizationThemeSwitcher />

        {/* Theme effects */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-secondary">
                Sample Card
              </h2>
              <p className="text-muted-foreground mb-4">
                This card demonstrates how the theme colors are applied
                automatically throughout your application components.
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded">
                  Secondary Button
                </button>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-secondary">
                Your Existing Styles
              </h2>
              <p className="text-muted-foreground mb-4">
                Your existing CSS classes work unchanged and automatically adapt
                to themes.
              </p>
              <div className="space-y-2">
                <button className="infoBtn mr-2">Info Style</button>
                <button className="editBtn mr-2">Edit Style</button>
                <button className="addBtn mr-2">Add Style</button>
                <span className="deleteBtn cursor-pointer px-2 py-1">
                  Delete Style
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
