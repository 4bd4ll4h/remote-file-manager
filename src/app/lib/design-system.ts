// Design System Tokens
export const designTokens = {
  colors: {
    primary: {
      light: {
        purple: 'purple-600',
        pink: 'pink-300',
        green: 'green-500',
        blue: 'blue-500',
      },
      dark: {
        purple: 'purple-500',
        pink: 'pink-400',
        green: 'green-400',
        blue: 'blue-400',
      }
    },
    status: {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue',
    },
    glass: {
      light: {
        background: 'bg-white/40',
        border: 'border-pink-300/60',
        hover: 'hover:bg-white/10',
      },
      dark: {
        background: 'bg-slate-900/40',
        border: 'border-purple-500/60',
        hover: 'hover:bg-black/20',
      }
    }
  },
  effects: {
    backdrop: {
      light: 'backdrop-blur-[15px] backdrop-saturate-[150%]',
      dark: 'backdrop-blur-[30px] backdrop-saturate-[200%]',
      active: 'backdrop-blur-[30px] backdrop-saturate-[200%]',
    },
    transitions: {
      default: 'transition-all duration-300',
      fast: 'transition-all duration-150',
      slow: 'transition-all duration-500',
    },
    animations: {
      scale: {
        hover: 'hover:scale-102',
        active: 'transform scale-[1.07]',
        button: 'hover:scale-110',
      }
    }
  },
  spacing: {
    container: 'p-4',
    button: 'px-3 py-2',
    input: 'px-3 py-2',
    card: 'p-6',
  },
  borderRadius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  }
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      light: 'bg-purple-600 text-white hover:bg-purple-700',
      dark: 'bg-purple-500 text-white hover:bg-purple-600',
    },
    secondary: {
      light: 'bg-pink-300/30 text-purple-800 hover:text-purple-900 border border-pink-300/30',
      dark: 'bg-purple-500/30 text-purple-200 hover:text-white border border-purple-500/30',
    },
    glass: {
      light: 'bg-white/40 text-gray-800 border border-pink-300/60 hover:bg-white/10',
      dark: 'bg-slate-900/40 text-white border border-purple-500/60 hover:bg-black/20',
    }
  },
  card: {
    glass: {
      light: 'bg-white/40 border border-pink-300/60 backdrop-blur-[15px] backdrop-saturate-[150%]',
      dark: 'bg-slate-900/40 border border-purple-500/60 backdrop-blur-[15px] backdrop-saturate-[150%]',
    }
  },
  input: {
    glass: {
      light: 'bg-white/60 border border-pink-300/40 focus:border-purple-500/60 backdrop-blur-[10px] text-gray-800',
      dark: 'bg-slate-800/60 border border-purple-500/40 focus:border-purple-400/60 backdrop-blur-[10px] text-white',
    }
  }
};

// Utility function to get theme-aware classes
export const getThemeClasses = (isDark: boolean, baseClasses: string, lightClasses: string, darkClasses: string) => {
  return `${baseClasses} ${isDark ? darkClasses : lightClasses}`;
}; 