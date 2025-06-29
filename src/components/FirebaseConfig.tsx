
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

const FirebaseConfig = () => {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔥</span>
          Firebase Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To enable the like, comment, and share features, you'll need to set up Firebase:
          </AlertDescription>
        </Alert>
        
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
          <li>Create a new project or select an existing one</li>
          <li>Add a web app to your project</li>
          <li>Copy the configuration object</li>
          <li>Replace the firebaseConfig in src/pages/Index.tsx with your actual config</li>
          <li>Enable Firestore Database in your Firebase project</li>
        </ol>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Your Firebase config should look like:</h4>
          <pre className="text-xs overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "987654321",
  appId: "your-actual-app-id"
};`}
          </pre>
        </div>

        <Alert>
          <AlertDescription>
            The app will work in demo mode without Firebase, but likes and comments won't persist between sessions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default FirebaseConfig;
