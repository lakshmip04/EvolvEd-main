# EvolvEd - AI-Powered Learning Assistant

EvolvEd is a comprehensive MERN (MongoDB, Express, React, Node.js) stack application designed to enhance the learning experience with AI-powered features. It includes flashcards, notes, and task management to help students organize and optimize their study sessions.

## Features

- **User Authentication**: Secure login and registration system
- **AI Notes**: Create, edit and organize your study notes with AI assistance
- **Flashcards**: Create and study flashcards with spaced repetition
- **Tasks & To-Do**: Manage your study schedule and track your progress
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Redux, TailwindCSS, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI API

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or higher)
- MongoDB account (for database)
- OpenAI API key (for AI features)

## Installation

1. Clone the repository
   ```
   git clone https://github.com/lakshmip04/EvolvEd-main.git
   cd EvolvEd-main
   ```

2. Install dependencies for backend and frontend
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server
   ```
   npm run dev
   ```

This will start both the backend server and the React frontend concurrently. The application will be available at http://localhost:3000.

## Project Structure

```
EvolvEd/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── app/            # Redux store
│       ├── components/     # Reusable components
│       ├── features/       # Redux slices
│       └── pages/          # Page components
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
├── .env                    # Environment variables
└── package.json            # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/me` - Get current user profile

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Flashcards
- `GET /api/flashcards` - Get all flashcard decks
- `POST /api/flashcards` - Create a new deck
- `GET /api/flashcards/:id` - Get a specific deck
- `PUT /api/flashcards/:id` - Update a deck
- `DELETE /api/flashcards/:id` - Delete a deck
- `POST /api/flashcards/:id/cards` - Add a card to a deck
- `PUT /api/flashcards/:id/cards/:cardId` - Update a specific card
- `DELETE /api/flashcards/:id/cards/:cardId` - Delete a specific card

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task


