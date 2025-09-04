import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  RefreshCw,
  Download,
  Search
} from 'lucide-react';
import { 
  scanAndUpdateForms, 
  validatePDFFilenames, 
  getFormsNeedingPDFs,
  getFormsWithPDFs,
  exportUpdatedFormsDatabase
} from '../utils/formsUpdate';

const FormsBulkUpdate = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [validationResults, setValidationResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get current forms status
  const formsNeedingPDFs = getFormsNeedingPDFs();
  const formsWithPDFs = getFormsWithPDFs();

  const handleScanDirectory = async () => {
    if (!selectedDirectory) {
      alert('Please select a directory first');
      return;
    }

    setScanning(true);
    try {
      const results = await scanAndUpdateForms(selectedDirectory);
      setScanResults(results);
      
      if (results.success) {
        // Refresh the page or update state to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
      setScanResults({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setScanning(false);
    }
  };

  const handleValidateFilenames = (filenames) => {
    const results = validatePDFFilenames(filenames);
    setValidationResults(results);
  };

  const handleExportDatabase = () => {
    const updatedDatabase = exportUpdatedFormsDatabase();
    const blob = new Blob([JSON.stringify(updatedDatabase, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `updated_forms_database_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredFormsNeedingPDFs = Object.entries(formsNeedingPDFs)
    .filter(([code, form]) => 
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Directory Scanner */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Directory Scanner</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Directory Path
            </label>
            <input
              type="text"
              placeholder="/path/to/forms/folder"
              value={selectedDirectory}
              onChange={(e) => setSelectedDirectory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleScanDirectory}
              disabled={scanning || !selectedDirectory}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan Directory
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExportDatabase}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Database
            </button>
          </div>
        </div>

        {/* Scan Results */}
        {scanResults && (
          <div className={`p-4 rounded-lg border ${
            scanResults.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {scanResults.success ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">{scanResults.message}</span>
            </div>
            
            {scanResults.updatedForms && (
              <div className="mt-3 text-sm">
                <p>Updated: {scanResults.updatedForms.updatedCount} forms</p>
                <p>Total files found: {scanResults.foundPDFs?.length || 0}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forms Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Forms Needing PDFs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Forms Needing PDFs</h4>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {Object.keys(formsNeedingPDFs).length}
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(formsNeedingPDFs).slice(0, 5).map(([code, form]) => (
              <div key={code} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div>
                  <span className="font-mono text-sm font-medium text-red-800">{code}</span>
                  <p className="text-xs text-red-600">{form.name}</p>
                </div>
                <span className="text-xs text-red-500">{form.category}</span>
              </div>
            ))}
            
            {Object.keys(formsNeedingPDFs).length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{Object.keys(formsNeedingPDFs).length - 5} more forms
              </p>
            )}
          </div>
        </div>

        {/* Forms With PDFs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Forms With PDFs</h4>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {Object.keys(formsWithPDFs).length}
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(formsWithPDFs).slice(0, 5).map(([code, form]) => (
              <div key={code} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div>
                  <span className="font-mono text-sm font-medium text-green-800">{code}</span>
                  <p className="text-xs text-green-600">{form.name}</p>
                </div>
                <span className="text-xs text-green-500">{form.category}</span>
              </div>
            ))}
            
            {Object.keys(formsWithPDFs).length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{Object.keys(formsWithPDFs).length - 5} more forms
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload PDFs
            </button>
            
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              Validate Filenames
            </button>
            
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Forms Needing PDFs - Detailed List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Forms Needing PDFs - Detailed List
            </h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-sm text-gray-500">
                {filteredFormsNeedingPDFs.length} of {Object.keys(formsNeedingPDFs).length} forms
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFormsNeedingPDFs.map(([code, form]) => (
                <tr key={code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">{code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{form.name}</div>
                      <div className="text-sm text-gray-500">{form.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {form.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      form.priority === 'A' ? 'bg-red-100 text-red-800' :
                      form.priority === 'B' ? 'bg-orange-100 text-orange-800' :
                      form.priority === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {form.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {form.required ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      PDF Missing
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormsBulkUpdate;
