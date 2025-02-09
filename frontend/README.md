# Heart Rate Music Player

A web application that plays music based on your heart rate using a Garmin device connection.

## Features

- Connect to Garmin devices via Bluetooth
- Upload and manage Spotify playlists
- Automatic song selection based on heart rate
- Queue management system
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A modern web browser with Bluetooth support
- A Garmin device that broadcasts heart rate

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/heart-rate-music-player.git
   cd heart-rate-music-player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your Spotify Client ID to the `.env` file

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.