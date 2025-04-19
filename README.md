# portfolio

## Overview
This is a fully custom-built personal portfolio website developed using **Node.js**, with **Docker** and **CI/CD** integration. The website serves as a dynamic and interactive platform to showcase projects, creative work, and professional expertise. It highlights technical skills, personal projects, and achievements in a well-structured and engaging manner.

## Features
- **Custom-built with Node.js** for a flexible and efficient backend
- **Dockerized** for seamless deployment across environments
- **CI/CD Integration** ensuring automated builds, testing, and deployments
- **Automated Testing** with Jest and Supertest for reliability
- **Environment Configuration** with dotenv for flexible deployment settings
- **Performance Optimized** for fast load times and responsive animations
- **Hardware-accelerated transitions** for smooth, stutter-free user interactions
- **Custom cursor implementation** with fluid movement and interactive feedback
- **Responsive Design** for an optimal user experience across all devices
- **Interactive and Engaging UI** providing smooth navigation and dynamic content
- **Cloud Hosting** for reliable and scalable deployment
- **Privacy-Focused Analytics** using Umami for user insights without compromising privacy

## Technologies Used
- **Node.js** - Backend development (Node 20)
- **Express** - Web framework
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline with automated testing
- **Jest & Supertest** - Testing framework
- **Caddy** - Reverse proxy and server optimization
- **HTML5, CSS3, JavaScript** - Frontend development
- **RequestAnimationFrame API** - Smooth animations and transitions
- **CSS Hardware Acceleration** - Enhanced performance for animations
- **DigitalOcean** - Cloud hosting solutions
- **Umami** - Privacy-friendly analytics for tracking user interactions

## Project Structure
```
portfolio-website/
│
├── .github/                # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline definition
│
├── __tests__/              # Test files
│   ├── server.test.js      # API endpoint tests
│   └── static.test.js      # Static asset tests
│
├── jest/                   # Jest configuration
│   └── setup-env.js        # Test environment setup
│
├── public/                 # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   ├── views/              # HTML templates
│   └── images/             # Image assets
│
├── .dockerignore           # Docker ignore file
├── .env                    # Environment variables (not in Git)
├── .gitignore              # Git ignore file
├── Dockerfile              # Docker container definition
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
└── server.js               # Main application entry point
```

## Installation and Setup

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerization)
- Git

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=8080
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:8080`

### Running Tests
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t portfolio:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 -e NODE_ENV=production portfolio:latest
   ```

## CI/CD Pipeline
This project uses GitHub Actions for continuous integration and deployment:

1. On push to the main branch, the CI/CD pipeline:
   - Runs tests to ensure code quality
   - Builds a Docker image with the current version
   - Implements blue-green deployment strategy for zero-downtime updates
   - Deploys to the production server

## Recent Improvements
- Upgraded to Node.js 20 for better performance
- Added automated testing with Jest
- Implemented environment configuration with dotenv
- Enhanced CI/CD pipeline with testing integration
- Added blue-green deployment for zero-downtime updates
- Optimized image loading for high-resolution displays
- Enhanced transition animations between content sections
- Implemented hardware acceleration for smoother cursor movement
- Improved cross-project navigation with fluid transitions
- Refactored CSS for better maintainability and performance
- Implemented efficient event handling for smoother interactions
