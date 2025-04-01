from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import mimetypes
from datetime import datetime
from urllib.parse import unquote

# Create necessary directories if they don't exist
LEADS_DIR = 'leads'
CONTACTS_DIR = 'contacts'
for directory in [LEADS_DIR, CONTACTS_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def serve_file(self, filepath):
        try:
            # Simple direct path resolution from current directory
            if filepath.startswith('/'):
                filepath = filepath[1:]
            
            full_path = os.path.join(os.getcwd(), filepath)
            print("\nDEBUG FILE SERVING:")
            print(f"1. Original path: {filepath}")
            print(f"2. Current working dir: {os.getcwd()}")
            print(f"3. Full path: {full_path}")
            print(f"4. File exists? {os.path.exists(full_path)}")
            print(f"5. Is file? {os.path.isfile(full_path)}")
            if os.path.exists(full_path):
                print(f"6. File size: {os.path.getsize(full_path)}")
            
            if not os.path.exists(full_path):
                print(f"File not found: {full_path}")
                self.send_response(404)
                self.end_headers()
                return

            content_type, _ = mimetypes.guess_type(filepath)
            if not content_type:
                content_type = 'application/octet-stream'
            print(f"7. Content type: {content_type}")

            with open(full_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.end_headers()
            self.wfile.write(content)

        except Exception as e:
            print(f"Error serving file: {e}")
            self.send_response(500)
            self.end_headers()

    def do_GET(self):
        print(f"\nGET request received for path: {self.path}")
        path = unquote(self.path)
        
        if path == '/':
            path = '/index.html'
            
        self.serve_file(path)

    def do_POST(self):
        print(f"\nPOST request received for path: {self.path}")
        print(f"Headers: {self.headers}")
        
        if self.path == '/api/submit-lead':
            try:
                print("\nProcessing lead submission...")
                content_length = int(self.headers['Content-Length'])
                print(f"Content length: {content_length}")
                
                post_data = self.rfile.read(content_length)
                print(f"Raw POST data: {post_data.decode('utf-8')}")
                
                lead_data = json.loads(post_data.decode('utf-8'))
                print(f"Parsed lead data: {json.dumps(lead_data, indent=2)}")

                # Create filename based on form type and date
                form_type = lead_data.get('formType', 'unknown')
                date_str = datetime.now().strftime('%Y-%m-%d')
                filename = f'{LEADS_DIR}/{form_type}_leads_{date_str}.json'
                print(f"Target file: {filename}")

                # Read existing leads or create new list
                leads = []
                if os.path.exists(filename):
                    print(f"Reading existing leads from {filename}")
                    with open(filename, 'r') as f:
                        leads = json.load(f)
                else:
                    print(f"Creating new leads file: {filename}")

                # Add new lead
                leads.append(lead_data)
                print(f"Added new lead. Total leads: {len(leads)}")

                # Save updated leads
                print(f"Saving leads to {filename}")
                with open(filename, 'w') as f:
                    json.dump(leads, f, indent=2)
                print("Leads saved successfully")

                # Send success response
                response_data = {'success': True}
                print(f"Sending success response: {json.dumps(response_data)}")
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                return
                
            except Exception as e:
                print(f"\nError processing lead:")
                print(f"Error type: {type(e).__name__}")
                print(f"Error message: {str(e)}")
                import traceback
                print(f"Error details: {traceback.format_exc()}")
                
                error_response = {'error': str(e)}
                print(f"Sending error response: {json.dumps(error_response)}")
                
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
                return

        elif self.path == '/api/submit-contact':
            try:
                print("\nProcessing contact form submission...")
                content_length = int(self.headers['Content-Length'])
                print(f"Content length: {content_length}")
                
                post_data = self.rfile.read(content_length)
                print(f"Raw POST data: {post_data.decode('utf-8')}")
                
                contact_data = json.loads(post_data.decode('utf-8'))
                print(f"Parsed contact data: {json.dumps(contact_data, indent=2)}")

                # Add timestamp
                contact_data['timestamp'] = datetime.now().isoformat()

                # Create filename based on date
                date_str = datetime.now().strftime('%Y-%m-%d')
                filename = f'{CONTACTS_DIR}/contacts_{date_str}.json'
                print(f"Target file: {filename}")

                # Read existing contacts or create new list
                contacts = []
                if os.path.exists(filename):
                    print(f"Reading existing contacts from {filename}")
                    with open(filename, 'r') as f:
                        contacts = json.load(f)
                else:
                    print(f"Creating new contacts file: {filename}")

                # Add new contact
                contacts.append(contact_data)
                print(f"Added new contact. Total contacts: {len(contacts)}")

                # Save updated contacts
                print(f"Saving contacts to {filename}")
                with open(filename, 'w') as f:
                    json.dump(contacts, f, indent=2)
                print("Contacts saved successfully")

                # Send success response
                response_data = {'success': True}
                print(f"Sending success response: {json.dumps(response_data)}")
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                return
                
            except Exception as e:
                print(f"\nError processing contact:")
                print(f"Error type: {type(e).__name__}")
                print(f"Error message: {str(e)}")
                import traceback
                print(f"Error details: {traceback.format_exc()}")
                
                error_response = {'error': str(e)}
                print(f"Sending error response: {json.dumps(error_response)}")
                
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
                return
        
        # If we get here, it means no valid endpoint was found
        print(f"No handler found for POST request to {self.path}")
        self.send_response(404)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"\nSTARTUP INFO:")
    print(f"1. Current working directory: {os.getcwd()}")
    print(f"2. Script location: {os.path.dirname(os.path.abspath(__file__))}")
    print(f"3. Directory contents: {os.listdir()}")
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run() 