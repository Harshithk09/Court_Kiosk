import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FormsUpload = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const results = [];

    for (const file of selectedFiles) {
      try {
        // Simulate file upload - replace with actual upload logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if filename matches a form code pattern
        const formCode = extractFormCode(file.name);
        
        if (formCode) {
          results.push({
            file: file.name,
            formCode,
            status: 'success',
            message: `Successfully uploaded ${formCode}`
          });
        } else {
          results.push({
            file: file.name,
            formCode: null,
            status: 'warning',
            message: 'Could not identify form code from filename'
          });
        }
      } catch (error) {
        results.push({
          file: file.name,
          formCode: null,
          status: 'error',
          message: `Upload failed: ${error.message}`
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(results);
    }
  };

  const extractFormCode = (filename) => {
    // Extract form codes like DV-100, FL-100, CH-100, etc.
    const formCodePattern = /([A-Z]{2}-\d+)/;
    const match = filename.match(formCodePattern);
    return match ? match[1] : null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const clearResults = () => {
    setUploadResults([]);
    setSelectedFiles([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Forms PDFs</h3>
      
      {/* File Selection */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-600 mb-4">
          <p className="text-lg font-medium">Select PDF files to upload</p>
          <p className="text-sm">Supported formats: PDF only</p>
          <p className="text-sm">Recommended naming: FormCode-Description.pdf (e.g., DV-100-Request.pdf)</p>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
        >
          Choose Files
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <span className="text-xs text-gray-500">
                  {extractFormCode(file.name) || 'No form code detected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900">Upload Results</h4>
            <button
              onClick={clearResults}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Results
            </button>
          </div>
          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center">
                  {getStatusIcon(result.status)}
                  <span className="ml-2 text-sm font-medium">{result.file}</span>
                  {result.formCode && (
                    <span className="ml-2 text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                      {result.formCode}
                    </span>
                  )}
                </div>
                <span className="text-sm">{result.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Upload Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use clear, descriptive filenames</li>
          <li>• Include the form code in the filename (e.g., DV-100, FL-100)</li>
          <li>• Ensure PDFs are readable and complete</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Files will be automatically categorized based on form codes</li>
        </ul>
      </div>
    </div>
  );
};

export default FormsUpload;
