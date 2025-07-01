'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export function AdminDocumentUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;
      
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        const formData = new FormData();
        formData.append('file', uploadFile.file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch('/api/admin/documents/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Update to processing
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'processing', progress: 100 }
            : f
        ));

        // Simulate processing time
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'completed' }
              : f
          ));
        }, 2000);

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : f
        ));
      }
    }
    
    setIsUploading(false);
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4" />;
      case 'uploading':
      case 'processing':
        return <Upload className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'uploading':
        return <Badge variant="outline">Uploading</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drag & drop documents here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, DOC, TXT, and MD files
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upload Queue ({files.length})</h3>
            <div className="space-x-2">
              <Button 
                onClick={uploadFiles} 
                disabled={isUploading || files.every(f => f.status !== 'pending')}
                size="sm"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
              <Button 
                onClick={() => setFiles([])} 
                variant="outline" 
                size="sm"
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(uploadFile.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(uploadFile.status)}
                      {uploadFile.status === 'pending' && (
                        <Button
                          onClick={() => removeFile(uploadFile.id)}
                          variant="ghost"
                          size="sm"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {uploadFile.status === 'uploading' && (
                      <span>{uploadFile.progress}%</span>
                    )}
                  </div>
                  
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}
                  
                  {uploadFile.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadFile.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Uploaded documents will be processed and made available to all users for AI-powered search and chat.
          Processing may take a few minutes depending on document size and complexity.
        </AlertDescription>
      </Alert>
    </div>
  );
}