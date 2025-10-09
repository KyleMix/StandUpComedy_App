import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const colors = [
  { name: "Background", className: "bg-background text-foreground border" },
  { name: "Card", className: "bg-card text-card-foreground border" },
  { name: "Primary", className: "bg-primary text-primary-foreground" },
  { name: "Secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "Accent", className: "bg-accent text-accent-foreground" },
  { name: "Muted", className: "bg-muted text-muted-foreground" },
  { name: "Success", className: "bg-success text-success-foreground" },
  { name: "Destructive", className: "bg-destructive text-destructive-foreground" }
];

const typographyScale = [
  { label: "Display / 4XL", className: "text-4xl font-display" },
  { label: "Display / 3XL", className: "text-3xl font-display" },
  { label: "Heading / 2XL", className: "text-2xl font-display" },
  { label: "Heading / XL", className: "text-xl font-display" },
  { label: "Body / LG", className: "text-lg" },
  { label: "Body / Base", className: "text-base" },
  { label: "Body / SM", className: "text-sm" },
  { label: "Caption / XS", className: "text-xs uppercase tracking-[0.22em] text-muted-foreground" }
];

const buttons = [
  { variant: "default", label: "Primary" },
  { variant: "outline", label: "Outline" },
  { variant: "ghost", label: "Ghost" }
] as const;

export default function UIPreviewPage() {
  return (
    <div className="space-y-10 py-12">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Design System</p>
            <h1>The Funny UI primitives</h1>
            <p className="max-w-2xl text-muted-foreground">
              Foundations that power The Funny across marketing, product, and booking experiences. All components respect light &
              dark themes, 8px spacing rhythm, and accessible contrast requirements.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Color tokens</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {colors.map((token) => (
              <div
                key={token.name}
                className={`flex h-28 flex-col justify-between rounded-xl p-3 text-xs font-medium shadow-sm ${token.className}`}
              >
                <span>{token.name}</span>
                <span className="text-[10px] uppercase tracking-[0.2em]">AA</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Typography scale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {typographyScale.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                <p className={item.className}>The punchline should be sharp.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {buttons.map((button) => (
              <Button key={button.variant} variant={button.variant}>
                {button.label}
              </Button>
            ))}
            <Button size="icon" aria-label="Icon button">
              🎤
            </Button>
            <Button size="sm" variant="ghost">
              Small ghost
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Form inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground" htmlFor="name-input">
                Name
              </label>
              <Input id="name-input" placeholder="Jane Comedian" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground" htmlFor="bio-input">
                Bio
              </label>
              <Textarea id="bio-input" placeholder="Tell bookers why you crush rooms." rows={3} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Verified</Badge>
              <Badge variant="outline">Pacific NW</Badge>
              <Badge variant="secondary" className="bg-muted text-foreground">
                Clean comedy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
