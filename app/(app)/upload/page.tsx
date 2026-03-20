 'use client';

  import { useState } from 'react';
  import { Upload } from 'lucide-react';

  export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    async function handleUpload() {
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      // Handle result
    }

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Revenue Report</h1>

        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            {uploading ? 'Processing...' : 'Upload & Analyze'}
          </button>
        </div>
      </div>
    );
  }

