/**
 * Shared Layout Components & Design Tokens
 * 
 * This file contains reusable layout primitives extracted from Documentation.jsx
 * Use these components to maintain visual consistency across the application.
 */

import { Copy, Check } from "lucide-react";
import { useState } from "react";

/**
 * Design Tokens
 * All spacing, colors, and typography follow Documentation.jsx standards
 */
export const designTokens = {
  // Colors
  colors: {
    primary: "blue-600",
    primaryHover: "blue-700",
    primaryLight: "blue-50",
    text: {
      primary: "slate-900",
      secondary: "slate-700",
      muted: "slate-600",
    },
    background: {
      primary: "white",
      secondary: "slate-50",
      tertiary: "slate-100",
    },
    border: {
      light: "slate-200",
      medium: "slate-300",
    },
  },

  // Spacing
  spacing: {
    xs: "2",
    sm: "4",
    md: "6",
    lg: "8",
    xl: "12",
    "2xl": "16",
    "3xl": "20",
  },

  // Typography
  typography: {
    display: "text-5xl lg:text-6xl",
    h1: "text-4xl",
    h2: "text-3xl",
    h3: "text-2xl",
    h4: "text-xl",
    h5: "text-lg",
    body: "text-base",
    small: "text-sm",
    xs: "text-xs",
  },

  // Shadows
  shadows: {
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },

  // Borders
  borders: {
    radius: {
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
      full: "rounded-full",
    },
  },
};

/**
 * CodeBlock Component
 * Displays syntax-highlighted code with copy functionality
 */
export function CodeBlock({ code, language = "jsx", title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {title && (
        <div className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-t-lg border-b border-slate-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className={`bg-slate-900 text-slate-100 p-4 overflow-x-auto ${title ? 'rounded-b-lg' : 'rounded-lg'} text-sm leading-relaxed`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Callout Component
 * Displays highlighted messages with different severity levels
 */
export function Callout({ type = "info", children, icon: CustomIcon }) {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconColor: "text-blue-600",
      text: "text-blue-900",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      text: "text-amber-900",
    },
    tip: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconColor: "text-emerald-600",
      text: "text-emerald-900",
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      text: "text-red-900",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`${style.bg} ${style.border} border-l-4 p-4 rounded-r-lg my-4`}>
      <div className="flex gap-3">
        {CustomIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <CustomIcon className={`w-5 h-5 ${style.iconColor}`} />
          </div>
        )}
        <div className={`${style.text} text-sm leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Section Component
 * Main content section with optional icon and title
 */
export function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
        {Icon && <Icon className="w-7 h-7 text-blue-600" />}
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/**
 * SubSection Component
 * Nested section within a main section
 */
export function SubSection({ title, children }) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * Card Component
 * Generic card container with consistent styling
 */
export function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`p-6 bg-white border border-slate-200 rounded-lg ${hover ? "hover:border-blue-400 hover:shadow-md transition-all" : ""
        } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Button Component
 * Standardized button with variants
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    outline: "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Container Component
 * Max-width container for content sections
 */
export function Container({ children, size = "default", className = "" }) {
  const sizes = {
    sm: "max-w-3xl",
    default: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={`container mx-auto px-6 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Grid Component
 * Responsive grid layout
 */
export function Grid({ children, cols = 2, gap = 6, className = "" }) {
  const colsMap = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colsMap[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageHeader Component
 * Standard page header with title and description
 */
export function PageHeader({ title, description, children }) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <Container className="py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        {description && (
          <p className="text-lg text-slate-600 mb-6">{description}</p>
        )}
        {children}
      </Container>
    </div>
  );
}

/**
 * FeatureCard Component
 * Card displaying a feature with icon, title, and description
 */
export function FeatureCard({ icon: Icon, title, description, accent = "blue" }) {
  const accentColors = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600",
    emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600",
    amber: "bg-amber-100 text-amber-600 group-hover:bg-amber-600",
    red: "bg-red-100 text-red-600 group-hover:bg-red-600",
  };

  return (
    <Card hover className="group">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 ${accentColors[accent]} rounded-lg group-hover:text-white transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Badge Component
 * Small label or tag
 */
export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

/**
 * Divider Component
 * Visual separator
 */
export function Divider({ className = "" }) {
  return <hr className={`border-t border-slate-200 my-8 ${className}`} />;
}
