// File upload security utilities
export class FileUploadSecurity {
  // Allowed file types for different contexts
  static readonly ALLOWED_FILE_TYPES = {
    image: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    all: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  };

  // Validate file type based on MIME type
  static validateFileType(file: File | { type: string }, allowedTypes: string[] = FileUploadSecurity.ALLOWED_FILE_TYPES.all): boolean {
    return allowedTypes.includes(file.type.toLowerCase());
  }

  // Validate file size (in bytes)
  static validateFileSize(file: File | { size: number }, maxSizeInMB: number = 5): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeInBytes;
  }

  // Sanitize file name to prevent directory traversal and other attacks
  static sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    // Remove path traversal characters
    let sanitized = fileName.replace(/\.\.\//g, '') // Remove ../
                                .replace(/\.\.\\/g, '') // Remove ..\
                                .replace(/\/\.\//g, '') // Remove /./
                                .replace(/\\\.\//g, ''); // Remove \.\

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    return sanitized;
  }

  // Check for suspicious file extensions that might bypass filters
  static hasSuspiciousExtension(fileName: string): boolean {
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse',
      '.wsf', '.wsh', '.msc', '.msp', '.mst', '.vbe', '.jse', '.pif', '.scf',
      '.lnk', '.hta', '.cpl', '.msi', '.msp', '.dll', '.so', '.sh'
    ];

    const lowerName = fileName.toLowerCase();
    return suspiciousExtensions.some(ext => lowerName.endsWith(ext));
  }

  // Validate uploaded file by checking both extension and MIME type
  static validateUploadedFile(file: File, maxSizeInMB: number = 5, allowedTypes: string[] = FileUploadSecurity.ALLOWED_FILE_TYPES.all): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file type
    if (!this.validateFileType(file, allowedTypes)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file size
    if (!this.validateFileSize(file, maxSizeInMB)) {
      errors.push(`File size exceeds ${maxSizeInMB}MB limit`);
    }

    // Check for suspicious extensions
    if (this.hasSuspiciousExtension(file.name)) {
      errors.push('File has suspicious extension that may pose security risks');
    }

    // Additional check: verify that the file extension matches its content
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension === 'svg' && file.type !== 'image/svg+xml') {
      errors.push('SVG file has incorrect MIME type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate secure file path to prevent directory traversal
  static generateSecureFilePath(originalName: string, destinationDir: string = 'uploads'): string {
    // Sanitize the original name
    const sanitized = this.sanitizeFileName(originalName);
    
    // Generate a unique name with timestamp to prevent conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const extension = sanitized.split('.').pop();
    const baseName = sanitized.replace(/\.[^/.]+$/, ""); // Remove extension
    
    // Create secure path in the destination directory
    const secureFileName = `${baseName}_${timestamp}_${randomString}${extension ? '.' + extension : ''}`;
    
    // Ensure path starts with the destination directory
    return `${destinationDir}/${secureFileName}`;
  }
}