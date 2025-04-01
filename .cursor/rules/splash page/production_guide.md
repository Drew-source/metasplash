Metaesthetics Splash Page Production Guide
Project Objective
Create a minimal, elegant splash page for Metaesthetics that collects email signups from patients and clinics. Focus on clean code, fast performance, and beautiful design.

mermaid

Copy
flowchart LR
    A[User Visits] --> B[View Splash Page]
    B --> C[Patient Signup] 
    B --> D[Clinic Signup]
    C --> E[Store in CSV]
    D --> E
Core Components
1. HTML Structure (Keep it Simple)
html

Copy

View all
  <section class="hero">
    <h2>The Future of Personalized Beauty</h2>
    <p>AI-powered aesthetic medicine platform</p>
    <div class="hero-image"><!-- App mockup --></div>
  </section>
  
  <!-- Dual Forms -->
  <section class="signup">
    <div class="patient">
      <!-- Patient Form -->
    </div>
    <div class="clinic">
      <!-- Clinic Form -->
    </div>
  </section>
  
  <!-- Footer -->
  <footer>
    <p>© 2025 Metaesthetics</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>
html 2


Open on canvas

2. CSS Approach
Single CSS file
No frameworks or external dependencies
CSS variables for colors only
Mobile-first design with minimal breakpoints
css

Copy
:root {
  --gold: #C9B18C;
  --beige: #F8F5F1;
  --dark: #333333;
}

/* Base styles here */
/* Responsive adjustments with minimal media queries */
3. JavaScript (Bare Essentials)
javascript

Copy
// Form validation and submission
document.addEventListener('DOMContentLoaded', () => {
  // Form handlers
  const patientForm = document.getElementById('patient-form');
  const clinicForm = document.getElementById('clinic-form');
  
  patientForm.addEventListener('submit', handleSubmit);
  clinicForm.addEventListener('submit', handleSubmit);
  
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveToCloud(formData, e.target.id);
  }
  
  function saveToCloud(data, formType) {
    // Simple fetch to Google Cloud Function
  }
});
Google Cloud Setup (Minimal)
Cloud Function
Single function to handle both form types
Store directly to CSV in Cloud Storage
No complex dependencies or middleware
javascript

Copy
// cloud-function.js
exports.saveSignup = (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  // Get form data
  const data = req.body;
  const formType = data.formType; // 'patient' or 'clinic'
  delete data.formType;
  
  // Format as CSV line
  const timestamp = new Date().toISOString();
  const values = Object.values(data);
  const csvLine = `${timestamp},${values.join(',')}\n`;
  
  // Choose storage file based on form type
  const filename = formType === 'patient' ? 'patients.csv' : 'clinics.csv';
  
  // Store in Cloud Storage
  const {Storage} = require('@google-cloud/storage');
  const storage = new Storage();
  const bucket = storage.bucket('metaesthetics-leads');
  
  // Append to file (create if doesn't exist)
  return bucket.file(filename)
    .download()
    .then(data => {
      const existingContent = data[0].toString();
      return bucket.file(filename).save(existingContent + csvLine);
    })
    .catch(() => {
      // Create new file with headers
      const headers = `timestamp,${Object.keys(data).join(',')}\n`;
      return bucket.file(filename).save(headers + csvLine);
    })
    .then(() => {
      res.status(200).send({success: true});
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({success: false});
    });
};
Form Fields (Absolute Essentials Only)
Patient Form
Name
Email
Interest (dropdown: Face/Body/Skin)
Consent checkbox
Clinic Form
Clinic Name
Contact Person
Email
Location
Consent checkbox
Design Guidelines
Colors
Primary: Gold (#C9B18C)
Background: Beige (#F8F5F1)
Text: Dark (#333333)
Typography
Headings: Montserrat (300 weight)
Body: Open Sans (400 weight)
Load from Google Fonts, only the weights needed
Visual Style
Elegant, minimalist
Single app mockup image (SVG if possible)
Subtle separation between sections
No borders unless necessary
Generous white space
Development Rules
No frameworks - vanilla HTML/CSS/JS only
No libraries - no jQuery, Bootstrap, etc.
Minimal dependencies - Google Fonts only if needed
Optimize images - use SVG where possible
Single CSS file - no CSS imports
Single JS file - no JS imports
Mobile-first - minimal breakpoints (mobile, desktop)
Minimal animations - subtle fade-ins only
Clean semantic HTML - no div soup
Performance Targets
Total page size < 300KB
HTML < 10KB
CSS < 10KB
JS < 10KB
Load time < 1s
Testing Requirements
Works on modern browsers (Chrome, Safari, Firefox, Edge)
Mobile-friendly (iPhone, Android)
Forms submit correctly to Google Cloud
Validation prevents empty submissions