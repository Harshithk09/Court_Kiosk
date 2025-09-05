import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import formsDatabase, { 
  getFormsSummary 
} from '../data/formsDatabase';
import FormsUpload from './FormsUpload';
import FormsBulkUpdate from './FormsBulkUpdate';
import { 
  exportFormsListToCSV, 
  exportSetupInstructions 
} from '../utils/generateFormsFolder';

const FormsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'upload', 'bulk-update', 'setup'

  // Get forms summary
  const summary = useMemo(() => getFormsSummary(), []);

  // Filter and sort forms
  const filteredForms = useMemo(() => {
    let forms = Object.entries(formsDatabase);

    // Apply filters
    if (searchTerm) {
      forms = forms.filter(([code, form]) => 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      forms = forms.filter(([_, form]) => form.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      forms = forms.filter(([_, form]) => form.priority === selectedPriority);
    }

    if (selectedAvailability !== 'all') {
      forms = forms.filter(([_, form]) => {
        if (selectedAvailability === 'available') return form.pdf_available;
        if (selectedAvailability === 'unavailable') return !form.pdf_available;
        return true;
      });
    }

    // Apply sorting
    forms.sort(([codeA, formA], [codeB, formB]) => {
      let a, b;
      
      switch (sortBy) {
        case 'code':
          a = codeA;
          b = codeB;
          break;
        case 'name':
          a = formA.name;
          b = formB.name;
          break;
        case 'category':
          a = formA.category;
          b = formB.category;
          break;
        case 'priority':
          a = formA.priority;
          b = formB.priority;
          break;
        case 'required':
          a = formA.required;
          b = formB.required;
          break;
        default:
          a = codeA;
          b = codeB;
      }

      if (sortOrder === 'asc') {
        return a < b ? -1 : a > b ? 1 : 0;
      } else {
        return a > b ? -1 : a < b ? 1 : 0;
      }
    });

    return forms;
  }, [searchTerm, selectedCategory, selectedPriority, selectedAvailability, sortBy, sortOrder]);

  // Get unique categories and priorities for filters
  const categories = useMemo(() => 
    [...new Set(Object.values(formsDatabase).map(form => form.category))].sort(), 
    []
  );

  const priorities = useMemo(() => 
    [...new Set(Object.values(formsDatabase).map(form => form.priority))].sort(), 
    []
  );

  const handleUploadPDF = (formCode) => {
    // This would integrate with your file upload system
    console.log(`Uploading PDF for form ${formCode}`);
    // You can implement file upload logic here
  };

  const handleDownloadPDF = (formCode) => {
    // This would integrate with your file download system
    console.log(`Downloading PDF for form ${formCode}`);
    // You can implement file download logic here
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return 'bg-red-100 text-red-800 border-red-200';
      case 'B': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Domestic Violence': return 'bg-red-50 border-red-200';
      case 'Civil Harassment': return 'bg-orange-50 border-orange-200';
      case 'Divorce': return 'bg-yellow-50 border-yellow-200';
      case 'Fee Waiver': return 'bg-blue-50 border-blue-200';
      case 'Law Enforcement': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Forms Management</h2>
            <p className="text-gray-600">Manage all court forms and PDF availability</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              {showUpload ? 'Hide Upload' : 'Bulk Upload PDFs'}
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Forms List
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Forms</p>
                <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">PDFs Available</p>
                <p className="text-2xl font-bold text-green-900">{summary.byAvailability.available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">PDFs Missing</p>
                <p className="text-2xl font-bold text-yellow-900">{summary.byAvailability.unavailable}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{Object.keys(summary.byCategory).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>Priority {priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PDF Status</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Forms</option>
              <option value="available">PDF Available</option>
              <option value="unavailable">PDF Missing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="code">Form Code</option>
              <option value="name">Form Name</option>
              <option value="category">Category</option>
              <option value="priority">Priority</option>
              <option value="required">Required Status</option>
            </select>
          </div>
        </div>

        {/* Sort Order Toggle */}
        <div className="flex items-center justify-end mt-4">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload PDFs
          </button>
          <button 
            onClick={() => setActiveTab('bulk-update')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'bulk-update' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulk Update
          </button>
          <button 
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'setup' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Setup
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>Priority {priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF Status</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Forms</option>
                  <option value="available">PDF Available</option>
                  <option value="unavailable">PDF Missing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="code">Form Code</option>
                  <option value="name">Form Name</option>
                  <option value="category">Category</option>
                  <option value="priority">Priority</option>
                  <option value="required">Required Status</option>
                </select>
              </div>
            </div>

            {/* Sort Order Toggle */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <FormsUpload 
            onUploadComplete={(results) => {
              console.log('Upload completed:', results);
              // Here you would typically refresh the forms data
              // or update the forms database
            }}
          />
        )}

        {activeTab === 'bulk-update' && (
          <FormsBulkUpdate />
        )}

        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Forms Setup Instructions</h3>
              <p className="text-blue-800 mb-4">
                Use these tools to set up your forms folder structure and get organized for PDF management.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={exportFormsListToCSV}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Forms List (CSV)
                </button>
                <button 
                  onClick={exportSetupInstructions}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Setup Instructions
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Setup Commands</h4>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-600 mb-2"># Create the forms folder structure:</p>
                <p className="text-green-600">mkdir -p forms/</p>
                <p className="text-green-600">mkdir -p forms/domestic-violence/</p>
                <p className="text-green-600">mkdir -p forms/divorce/</p>
                <p className="text-green-600">mkdir -p forms/civil-harassment/</p>
                <p className="text-green-600">mkdir -p forms/law-enforcement/</p>
                <p className="text-green-600">mkdir -p forms/fee-waiver/</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  PDF Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForms.map(([code, form]) => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(form.category)}`}>
                      {form.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(form.priority)}`}>
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
                    {form.pdf_available ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {form.pdf_available ? (
                        <button
                          onClick={() => handleDownloadPDF(code)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUploadPDF(code)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredForms.length}</span> of{' '}
              <span className="font-medium">{summary.total}</span> forms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsManagement;
