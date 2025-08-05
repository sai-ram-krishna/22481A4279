# URL Shortener Application

A professional, feature-rich URL shortener built with React that provides link management and analytics capabilities.

## Features

### Link Generation
- **Multiple Generators**: 6 simultaneous link generation forms
- **Custom Aliases**: Optional custom short codes
- **Expiration Control**: Set link expiration from 1 minute to 1 week
- **URL Validation**: Automatic validation for proper URL format
- **Conflict Prevention**: Prevents duplicate custom aliases

### Analytics Dashboard
- **Real-time Statistics**: Total links, active links, total clicks, and average clicks
- **Advanced Filtering**: Filter by all, active, or expired links
- **Smart Sorting**: Sort by newest, oldest, or most clicked
- **Click Tracking**: Detailed click history with timestamps, device info, and referrers
- **Status Monitoring**: Visual indicators for active and expired links

### Data Management
- **Local Storage**: Persistent data storage in browser
- **Automatic Redirect**: Direct short link navigation
- **Click Analytics**: Comprehensive click tracking and reporting

## Technology Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: Custom CSS with professional design
- **Storage**: Browser localStorage
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sai-ram-krishna/22481A4279.git
cd 22481A4279
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Creating Short Links
1. Navigate to the "Link Generator" tab
2. Enter your long URL in any of the 6 generator forms
3. Optionally set custom alias and expiration time
4. Click "Generate Short Link"
5. Copy the generated short link

### Viewing Analytics
1. Navigate to the "Analytics Dashboard" tab
2. View overall statistics at the top
3. Use filters to show specific link types
4. Sort links by different criteria
5. Expand individual links to see detailed click history

### Using Short Links
- Short links automatically redirect to original URLs
- Click data is tracked and stored for analytics
- Expired links show appropriate error messages

## Project Structure

```
src/
├── App.js          # Main application component
├── App.css         # Professional styling
├── index.js        # Application entry point
└── ...
```

## Key Components

- **URLShortenerApp**: Main application with navigation
- **LinkGeneratorInterface**: Multiple form interface for link creation
- **AnalyticsDashboard**: Comprehensive analytics and reporting

## Features in Detail

### Link Generation Algorithm
- Combines timestamp-based and random character generation
- Ensures uniqueness across all generated codes
- Supports custom aliases with validation

### Analytics Features
- Real-time click tracking
- Device and referrer information
- Historical click data
- Advanced filtering and sorting options

### Data Persistence
- All data stored in browser localStorage
- Automatic saving on every change
- Data persists across browser sessions

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Author

Sai Ram Krishna (22481A4279)

## Development Notes

- Built with original algorithms and implementations
- Professional UI design with neutral colors
- Comprehensive error handling and validation
- Responsive design for multiple screen sizes
