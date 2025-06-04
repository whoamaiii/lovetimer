# Timer App - Codex Container Setup

This document provides complete instructions for setting up and running the Love Timer application in a containerized environment with OpenAI Codex integration.

## Project Overview

**Love Timer** is a romantic web application built with Vite and vanilla JavaScript that counts seconds since a configurable start date, featuring:

- Real-time timer counting seconds elapsed
- Rotating romantic messages with fade transitions
- Animated floating hearts
- Responsive design for all devices
- Beautiful gradient background with animations

## Container Setup

### Prerequisites

- Docker installed and running
- OpenAI API key for Codex integration
- Node.js 18+ (for local development)

### Docker Configuration

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  timer-app:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev -- --host 0.0.0.0
```

## Project Structure

```
timer/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── src/
│   ├── main.js             # Timer logic and functionality
│   └── style.css           # Styles and animations
├── public/                 # Static assets (empty by default)
├── node_modules/           # Dependencies
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Multi-container orchestration
└── CODEX_SETUP.md         # This file
```

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

### Container Development
```bash
# Build and start container
docker-compose up --build

# Start existing container
docker-compose up

# Stop container
docker-compose down

# Access container shell
docker-compose exec timer-app sh
```

## Configuration

### Timer Settings

Edit `src/main.js` to customize the timer:

```javascript
// Line 4-5: Set your anniversary date
const START_DATE = new Date();
START_DATE.setMonth(START_DATE.getMonth() - 6); // 6 months ago

// Or set a specific date:
// const START_DATE = new Date('2023-06-15T14:30:00');
```

### Romantic Messages

Customize messages in `src/main.js` (lines 8-19):

```javascript
const messages = [
    "Our love grows stronger with each passing moment",
    "Every heartbeat brings us closer together",
    // Add your own messages here
];
```

## OpenAI Codex Integration

### Environment Variables

Create `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
CODEX_MODEL=code-davinci-002
NODE_ENV=development
```

### Codex Configuration

For AI-assisted development, the project supports:

1. **Code Generation**: Use Codex to generate new features
2. **Bug Fixing**: AI-powered debugging assistance
3. **Optimization**: Performance improvements suggestions
4. **Feature Enhancement**: Add new romantic features

### Example Codex Prompts

```
// Generate a new romantic message
"Add a new romantic message to the messages array that talks about eternal love"

// Create a new animation
"Create a CSS animation for shooting stars in the background"

// Add interactivity
"Add a button to pause/resume the timer with smooth transitions"

// Enhance styling
"Make the timer display more elegant with better typography and spacing"
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# The dist/ folder contains optimized files
```

### Container Production

Create `Dockerfile.prod`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Development Workflow with Codex

1. **Start Container**: `docker-compose up`
2. **Access App**: http://localhost:5173
3. **Use Codex**: Generate code improvements
4. **Hot Reload**: Changes reflect instantly
5. **Test Features**: Verify new functionality
6. **Commit Changes**: Save progress

## Troubleshooting

### Common Issues

1. **Port 5173 in use**: Change port in docker-compose.yml
2. **Container won't start**: Check Docker is running
3. **Hot reload not working**: Ensure volume mounts are correct
4. **Codex API errors**: Verify OPENAI_API_KEY is set

### Debug Commands

```bash
# Check container logs
docker-compose logs timer-app

# Restart container
docker-compose restart

# Clean rebuild
docker-compose down
docker-compose up --build --force-recreate
```

## Features to Extend with Codex

- **Music Integration**: Add background music
- **Customization Panel**: Settings for colors, messages
- **Statistics**: Track viewing time, milestones
- **Sharing**: Generate shareable timer links
- **Themes**: Multiple visual themes
- **Countdown Mode**: Count down to future dates
- **Photo Integration**: Add couple photos
- **Memory Lane**: Display memories on special dates

## API Endpoints (Future)

The project is ready for backend integration:

```
GET /api/timer/:id - Get timer configuration
PUT /api/timer/:id - Update timer settings
POST /api/messages - Add custom messages
GET /api/stats/:id - Get timer statistics
```

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Validate all user inputs in production
- Use HTTPS in production deployments

## Support

For issues or questions:
1. Check container logs
2. Verify all dependencies are installed
3. Ensure proper environment configuration
4. Test with clean container rebuild

---

**Timer App - Making every second count! ❤️**