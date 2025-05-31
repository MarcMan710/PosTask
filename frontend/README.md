# PosTask Frontend

A modern, feature-rich task management application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Task Management**
  - Create, edit, and delete tasks
  - Organize tasks into projects
  - Track task progress and deadlines
  - Subtask support for complex tasks

- **Project Organization**
  - Create and manage multiple projects
  - Project-specific task views
  - Project progress tracking

- **Gamification**
  - Achievement system
  - Leaderboard
  - Progress tracking
  - Rewards and badges

- **User Experience**
  - Dark/Light theme support
  - Responsive design
  - Real-time updates
  - Intuitive navigation

## 🛠️ Tech Stack

- **Core**
  - React 18
  - TypeScript
  - Vite
  - React Router v6

- **Styling**
  - Tailwind CSS
  - Custom theme system
  - Responsive design

- **State Management**
  - React Context API
  - Custom hooks

- **Development Tools**
  - ESLint
  - TypeScript
  - Vite
  - Git

## 📦 Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── gamification/  # Gamification features
│   │   ├── projects/      # Project management
│   │   └── tasks/         # Task management
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── tests/                 # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

```bash
npm run test
# or
yarn test
```

## 📝 Code Style

This project uses ESLint and Prettier for code formatting. The configuration is in `.eslintrc.js` and `.prettierrc`.

## 🔄 TypeScript Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/*` - Source root
- `@components/*` - Components
- `@contexts/*` - Context providers
- `@hooks/*` - Custom hooks
- `@services/*` - API services
- `@utils/*` - Utility functions
- `@types/*` - Type definitions

## 🎨 Theme System

The application supports both light and dark themes using Tailwind CSS. Theme configuration can be found in `tailwind.config.js`.

## 🔒 Authentication

The application uses JWT-based authentication. Protected routes are wrapped with the `ProtectedRoute` component.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React Team
- Tailwind CSS Team
- Vite Team
- All contributors
