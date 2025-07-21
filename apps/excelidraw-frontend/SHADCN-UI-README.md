# shadcn/ui Setup for Excelidraw Frontend

## Overview

shadcn/ui has been set up in this project to provide a collection of reusable components built with Radix UI and Tailwind CSS.

## Available Components

The following components have been set up:

- Button
- Card (with CardHeader, CardContent, CardTitle, etc.)
- Input
- Separator

## How to Use

1. Import components from the `@/components/ui` directory:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
```

2. Use them in your components:

```tsx
<Card>
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

## Adding More Components

You can add more shadcn/ui components using the provided setup script:

```bash
node setup-shadcn.js
```

Or add individual components using the shadcn CLI:

```bash
pnpm dlx shadcn-ui@latest add [component-name]
```

Replace `[component-name]` with the name of the component you want to add, such as `dialog`, `dropdown-menu`, etc.

## Customization

You can customize the components by:

1. Modifying the CSS variables in `app/globals.css`
2. Editing the component files directly in `components/ui/`
3. Updating the Tailwind configuration in `tailwind.config.ts`

## Documentation

For more information on how to use and customize shadcn/ui components, visit the official documentation:

[shadcn/ui Documentation](https://ui.shadcn.com/docs)