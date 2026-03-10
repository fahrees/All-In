## Packages
recharts | For stunning asset composition and wealth charts
framer-motion | For premium page transitions and staggered list animations
lucide-react | Used extensively for iconography across the dashboard
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
We are using Replit Auth via `/api/login` route.
Zod is used to strictly validate all API responses on the frontend for safety.
