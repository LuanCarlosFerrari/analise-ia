# Document Analysis Tool

A web-based application for analyzing documents using the Gemini API. The tool supports multiple file formats and provides both structured and free-form analysis capabilities.

## Project Structure

### Frontend Components

#### CSS Structure
- **base.css**: Base styling rules and resets
- **components.css**: Reusable UI component styles
- **layout.css**: Grid and layout structure
- **transitions.css**: Animation and transition effects
- **utilities.css**: Utility classes and helpers
- **variables.css**: CSS variables for theming

#### JavaScript Modules

##### Main Modules
- **main.js**: Application entry point and initialization
- **api.js**: Gemini API integration and request handling
- **fileHandler.js**: File input and processing logic

##### Helper Modules
- **themeManager.js**: Dark/light theme switching functionality
- **uiManager.js**: UI state and display management
- **utils.js**: Utility functions for data processing
- **exporter.js**: Excel export functionality
- **documentTemplates.js**: Document analysis templates

## Key Features

### 1. File Handling
- Supports multiple file formats:
  - Images (jpg, png, etc.)
  - PDFs
  - Text files (txt, csv)
  - Excel files (xlsx, xls)
  - Word documents (doc, docx)

### 2. Analysis Capabilities
- **Structured Analysis**: Pre-defined templates for:
  - Invoice processing
  - Social contracts
  - Custom document types
- **Free-form Analysis**: Custom prompt support

### 3. UI Features
- Responsive grid layout
- Dark/light theme support
- Real-time file preview
- Progress indicators
- Error handling notifications

### 4. Export Features
- Excel export functionality
- Structured data output
- Batch processing support

## Technical Implementation

### CSS Architecture
- **Theme System**: CSS variables for light/dark modes
- **Grid Layout**: Two-panel responsive design
- **Component Design**: Modular and reusable components

### JavaScript Architecture
- **Module Pattern**: ES6 modules for code organization
- **Class-based Components**: OOP approach for UI management
- **Async Operations**: Promise-based file processing
- **Error Handling**: Comprehensive error management

### API Integration
- **Gemini API**: Image analysis capabilities
- **Retry Logic**: Built-in request retry mechanism
- **Rate Limiting**: API quota management

## Usage

1. Select one or more documents using the file input
2. (Optional) Enter a custom prompt for analysis
3. Click "Analyze Documents" to process files
4. View results in the right panel
5. Export results to Excel if needed

## Error Handling
- File format validation
- API error management
- User feedback for failures
- Retry mechanisms for failed requests

## Browser Compatibility
- Modern browser support
- Responsive design for mobile/desktop
- Graceful degradation for older browsers

## Development Considerations
- Modular code structure
- Maintainable CSS architecture
- Efficient file processing
- Secure API handling