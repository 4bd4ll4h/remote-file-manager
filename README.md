# 🚀 Remote File Manager

A modern, full-stack web application that transforms remote server file management through an intuitive, browser-based interface. Built with cutting-edge technologies and designed for developers, system administrators, and anyone who needs powerful remote file operations.

![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-blue?logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)

## ✨ Features

### 🔐 Secure Authentication
- **SSH Protocol Support**: Connect using SSH2 with password or private key authentication
- **Session Management**: Secure server sessions with automatic timeout handling
- **Multi-Server Support**: Manage multiple server connections simultaneously through tabbed interface

### 📁 Advanced File Management
- **Multiple View Modes**: List, Grid, and Details views with responsive design
- **Smart Filtering & Search**: Real-time file filtering with extension and name-based search
- **Natural Sorting**: Intelligent sorting by name, size, date, or type
- **Hidden Files Toggle**: Show/hide dotfiles with persistent preferences
- **Bulk Operations**: Select multiple files for copy, move, or delete operations

### 🎯 Professional UI/UX
- **Glassmorphism Design**: Modern glass-effect interface with blur and transparency
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Power-user features with comprehensive hotkey support
- **Drag & Drop**: Intuitive file upload with visual feedback

### ⚡ Real-time Features
- **Live Directory Watching**: WebSocket-based real-time file system monitoring
- **Progress Indicators**: Real-time feedback for all file operations
- **Auto-refresh**: Automatic file list updates when changes are detected
- **Toast Notifications**: Elegant success/error messaging system

### 🛠 File Operations
- **Upload/Download**: Seamless file transfer with progress tracking
- **Copy/Move/Rename**: Full file manipulation capabilities
- **Directory Management**: Create, navigate, and manage folder structures
- **Permissions Display**: View detailed file permissions, ownership, and metadata
- **Directory Size Calculation**: Recursive size calculation with caching

## 🏗 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Custom component library with glassmorphism effects
- **Icons**: Lucide React for consistent iconography

### Backend
- **Runtime**: Node.js with Next.js API routes
- **SSH Client**: SSH2 library for secure server connections
- **File Transfer**: SSH2-SFTP-Client for file operations
- **WebSocket**: Real-time communication for live updates
- **Session Management**: Secure session handling with automatic cleanup

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: Full TypeScript integration
- **Build System**: Next.js optimized bundling and deployment
- **CSS Framework**: PostCSS with Tailwind CSS processing

## 🎨 Design System

### Glassmorphism Architecture
The application features a sophisticated design system built around glassmorphism principles:

```typescript
// Design tokens with theme-aware variants
export const designTokens = {
  colors: {
    primary: {
      light: { purple: 'purple-600', pink: 'pink-300' },
      dark: { purple: 'purple-500', pink: 'pink-400' }
    },
    glass: {
      light: { background: 'bg-white/40', border: 'border-pink-300/60' },
      dark: { background: 'bg-slate-900/40', border: 'border-purple-500/60' }
    }
  },
  effects: {
    backdrop: 'backdrop-blur-[15px] backdrop-saturate-[150%]',
    transitions: 'transition-all duration-300'
  }
}
```

### Component Variants
- **Glass Cards**: Semi-transparent containers with blur effects
- **Gradient Backgrounds**: Custom radial gradients for depth
- **Hover Animations**: Smooth scale and blur transitions
- **Theme Consistency**: Unified design language across all components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- SSH access to target servers

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd remote-file-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Setup
The application requires no additional environment configuration for basic usage. All SSH connections are established client-side through the secure connection form.

## 📡 API Documentation

### Core Endpoints

#### Authentication
- `POST /server/api/connect` - Establish SSH connection
- `POST /server/api/disconnect` - Close SSH session

#### File Operations
- `GET /server/api/list` - List directory contents
- `POST /server/api/upload` - Upload files to remote server
- `GET /server/api/download` - Download files from remote server
- `POST /server/api/delete` - Delete files or directories
- `POST /server/api/copy` - Copy files or directories
- `POST /server/api/move` - Move/rename files or directories
- `POST /server/api/create` - Create new directories
- `POST /server/api/rename` - Rename files or directories

#### Utilities
- `GET /server/api/directory-size` - Calculate directory sizes
- `WS ws://localhost:3001` - WebSocket for real-time updates

### Example API Usage

```typescript
// List directory contents
const response = await fetch(
  `/server/api/list?serverId=${sessionId}&path=${encodeURIComponent(path)}`
);
const files = await response.json();

// Upload file
const formData = new FormData();
formData.append("file", file);
formData.append("serverId", sessionId);
formData.append("destinationPath", path);

const response = await fetch("/server/api/upload", {
  method: "POST",
  body: formData,
});
```

## 🏛 Architecture

### Project Structure
```
src/
├── app/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── FileBrowser.tsx # Main file browser interface
│   │   ├── ConnectForm.tsx # SSH connection form
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useFileOperations.ts
│   │   ├── useSessionTabs.tsx
│   │   └── ...
│   ├── lib/                # Utilities and configurations
│   │   ├── design-system.ts
│   │   ├── utils.ts
│   │   └── api.ts
│   ├── server/             # Backend implementation
│   │   ├── api/           # API route handlers
│   │   ├── lib/           # Server utilities
│   │   │   ├── ssh/       # SSH connection management
│   │   │   ├── session/   # Session handling
│   │   │   └── ws/        # WebSocket functionality
│   │   └── utils/         # Server-side utilities
│   └── styles/            # Global styles and themes
```

### Component Architecture

#### Smart Components
- **FileBrowser**: Main interface orchestrating all file operations
- **ConnectForm**: SSH connection establishment and authentication
- **TabContent**: Session management and navigation

#### Presentational Components
- **ListView/GridView/DetailsView**: Different file display modes
- **FileToolbar**: Action buttons and view controls
- **BulkOperationsToolbar**: Multi-file operation interface

#### Custom Hooks
- **useFileOperations**: File manipulation operations
- **useFileSelection**: Multi-file selection logic
- **useKeyboardShortcuts**: Keyboard navigation and shortcuts
- **useSessionTabs**: Tab-based session management
- **useTheme**: Dark/light theme management

### SSH Connection Management

```typescript
class SSHManager {
  private sessions: Map<string, UserSessions> = new Map();
  
  connect(userSessionId: string, serverId: string, options: SSHConnectOptions) {
    // Establish SSH connection with timeout handling
  }
  
  getClient(userSessionId: string, serverId: string) {
    // Retrieve active SSH client with session validation
  }
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all files |
| `Escape` | Deselect all files |
| `Ctrl+C` | Copy selected files |
| `Ctrl+V` | Paste files from clipboard |
| `Delete`/`Backspace` | Delete selected files |
| `F5`/`Ctrl+R` | Refresh file list |
| `Shift+Click` | Select range of files |
| `Ctrl+Click` | Toggle individual file selection |

## 🎯 Key Features Deep Dive

### Multi-View File Browser
- **List View**: Compact horizontal layout optimal for large directories
- **Grid View**: Card-based layout with hover actions and thumbnails
- **Details View**: Table format displaying full metadata (permissions, owner, group, size, modified date)

### Advanced File Processing
```typescript
const {
  viewMode,
  sortBy,
  processedFiles,
  setViewMode,
  handleSortChange,
  setFilterText,
  toggleHiddenFiles,
} = useFileListProcessing(rawFiles);
```

### Real-time Directory Monitoring
WebSocket-based folder watching that detects:
- File creation and deletion
- Directory modifications
- Real-time UI updates without page refresh

### Sophisticated State Management
- **TanStack Query**: Server state caching and synchronization
- **Context Providers**: Theme and session management
- **Local Storage**: Persistent user preferences
- **Optimistic Updates**: Immediate UI feedback

## 🛡 Security Features

- **Secure SSH Connections**: Industry-standard SSH2 protocol
- **Session Isolation**: User sessions are completely isolated
- **Automatic Cleanup**: Sessions timeout after 30 minutes of inactivity
- **No Credential Storage**: Passwords and keys are never persisted
- **Input Validation**: All user inputs are validated and sanitized

## 🚢 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Considerations
- Ensure SSH access to target servers
- Configure firewall rules for SSH connections
- Consider WebSocket port (3001) availability
- Set appropriate session timeout values

### Docker Deployment (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain component isolation and reusability
- Add proper error handling for all operations
- Include loading states for async operations
- Test across different screen sizes and themes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SSH2**: Robust SSH client implementation
- **Next.js**: Exceptional full-stack React framework
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Powerful data synchronization
- **Lucide**: Beautiful icon library

---

**Built with ❤️ for developers who demand better tools**
