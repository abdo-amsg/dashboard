import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Eye, Download } from 'lucide-react';
import api from '../services/api';

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState({});
  const { user } = useAuth();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/files');
      setFiles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (files.length === 0)
      fetchFiles();
    // Fetch all users for mapping userId to name
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/admin/users');
        const usersMap = {};
        response.data.forEach(u => {
          usersMap[u.id] = u.username;
        });
        setUsers(usersMap);
      } catch (err) {
        // Optionally handle error
        setUsers({});
      }
    };

    fetchUsers();
    // Set up polling for status updates
    // const interval = setInterval(fetchFiles, 10000); // Poll every 10 seconds
    // return () => clearInterval(interval);
  }, []);

  const getUserName = (userId) => {
    return users[userId] || 'Unknown';
  }

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-[var(--stat-card-background4)] text-[var(--stat-card-color4)] border-[var(--stat-card-color4)]',
          icon: <Clock className="w-4 h-4" />,
          label: 'Processing'
        };
      case 'processed':
        return {
          color: 'bg-[var(--stat-card-background2)] text-[var(--stat-card-color2)] border-[var(--stat-card-color2)]',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Completed'
        };
      case 'failed':
        return {
          color: 'bg-danger-light text-danger border-danger',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Failed'
        };
      default:
        return {
          color: 'bg-border text-text-primary border-border',
          icon: <FileText className="w-4 h-4" />,
          label: 'Unknown'
        };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-background rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-card-background rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-card-background rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 text-danger">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-background p-6">
      {/* Header */}
      <div className="bg-background rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">File Management</h1>
            <p className="text-text-secondary">
              View and manage your uploaded security reports. Use the upload button in the header to add new files.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-text-secondary">
              <span className="font-medium">{files.length}</span> files uploaded
            </div>
            <div className="flex items-center space-x-2 text-brand">
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload in header</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-background rounded-xl shadow-sm overflow-hidden">
        {files.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No files uploaded yet</h3>
            <p className="text-text-secondary mb-4">
              Start by uploading a security report using the upload button in the header
            </p>
            <div className="inline-flex items-center space-x-2 text-link">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Click the upload button above</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    Status
                  </th>
                  {user.is_superuser && (<th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    Uploaded By
                  </th>)}
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {files.map((file) => {
                  const statusInfo = getStatusInfo(file.status);
                  return (
                    <tr key={file.id} className="hover:bg-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-border-light rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-brand-dark" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {file.filename}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {file.file_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary">
                          {formatDate(file.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary">
                          {formatFileSize(file.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </span>
                      </td>
                      {user.is_superuser && (<td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary">
                          {file.uploaded_by ? getUserName(file.uploaded_by) : 'Unknown'}
                        </div>
                      </td>)}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Navigate to file details or logs
                              console.log('View file details:', file.id);
                            }}
                            className="text-brand hover:text-brand-dark p-1 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {file.status === 'processed' && (
                            <button
                              onClick={() => {
                                // Download or export functionality
                                console.log('Download file:', file.id);
                              }}
                              className="text-green-600 hover:text-green-700 p-1 rounded-lg transition-colors"
                              title="Download Results"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-card-background rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-border-light rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-brand-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {files.length}
                </div>
                <div className="text-sm text-text-secondary">Total Files</div>
              </div>
            </div>
          </div>

          <div className="bg-card-background rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[var(--stat-card-background2)] rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-[var(--stat-card-color2)]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {files.filter(f => f.status === 'processed').length}
                </div>
                <div className="text-sm text-text-secondary">Processed</div>
              </div>
            </div>
          </div>

          <div className="bg-card-background rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[var(--stat-card-background4)] rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-[var(--stat-card-color4)]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {files.filter(f => f.status === 'pending').length}
                </div>
                <div className="text-sm text-text-secondary">Processing</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;