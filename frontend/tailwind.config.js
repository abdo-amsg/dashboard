/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-color)',
        'brand-light': 'var(--brand-color-light)',
        'brand-dark': 'var(--brand-color-dark)',
        'text-primary': 'var(--text-color)',
        'text-secondary': 'var(--text-color-light)',
        'background': 'var(--background-color)',
        'main-background': 'var(--main-background)',
        'border': 'var(--border-color)',
        'border-light': 'var(--border-light)',
        'hover': 'var(--hover-color)',
        'button': 'var(--button-color)',
        'button-light': 'var(--button-color-light)',
        'button-dark': 'var(--button-color-dark)',
        'button-text': 'var(--button-text-color)',
        'card-background': 'var(--card-background-color)',
        'card-border': 'var(--card-border-color)',
        'input-border': 'var(--input-border-color)',
        'input-background': 'var(--input-background-color)',
        'input-text': 'var(--input-text-color)',
        'link': 'var(--link-color)',
        'link-hover': 'var(--link-hover-color)',
        'profile-background': 'var(--profile-background)',
        'danger': 'var(--danger-color)',
        'danger-light': 'var(--danger-color-light)',
        'highlight': 'var(--highlight-background)',
        'status-bg': 'var(--status-background)',
        'bg1': 'var(--stat-card-background1)',

        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        inwi: {
          border: "hsl(var(--border))",
          background: "hsl(var(--background))",
          boxShadow: {
            sm: "var(--shadow-sm)",
            md: "var(--shadow-md)",
            lg: "var(--shadow-lg)",
            xl: "var(--shadow-xl)",
          },
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        level1: {
          primary: "hsl(var(--level1-primary))",
          foreground: "hsl(var(--level1-primary-foreground))",
          secondary: "hsl(var(--level1-secondary))",
          accent: "hsl(var(--level1-accent))",
          muted: "hsl(var(--level1-muted))",
        },
        level2: {
          primary: "hsl(var(--level2-primary))",
          foreground: "hsl(var(--level2-primary-foreground))",
          secondary: "hsl(var(--level2-secondary))",
          accent: "hsl(var(--level2-accent))",
          muted: "hsl(var(--level2-muted))",
        },
        level3: {
          primary: "hsl(var(--level3-primary))",
          foreground: "hsl(var(--level3-primary-foreground))",
          secondary: "hsl(var(--level3-secondary))",
          accent: "hsl(var(--level3-accent))",
          muted: "hsl(var(--level3-muted))",
        },
        status: {
          critical: "hsl(var(--status-critical))",
          high: "hsl(var(--status-high))",
          medium: "hsl(var(--status-medium))",
          low: "hsl(var(--status-low))",
          info: "hsl(var(--status-info))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        "gradient-level1": "var(--gradient-level1)",
        "gradient-level2": "var(--gradient-level2)",
        "gradient-level3": "var(--gradient-level3)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
    plugins: [],
  }
}