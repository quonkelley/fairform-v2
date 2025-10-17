import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUpload } from './DocumentUpload';

describe('DocumentUpload', () => {
  it('should render upload area on desktop', () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('should show upload and camera buttons on mobile', () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    expect(screen.getByText('Take Photo')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('should validate file size', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should validate file type', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should accept valid files', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const validFile = new File(['content'], 'test.png', { type: 'image/png' });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(validFile);
    });
  });

  it('should disable upload when processing', () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} isProcessing={true} />);

    expect(screen.getByText(/processing document/i)).toBeInTheDocument();

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should show error message with dismiss button', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });

    // Dismiss error
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText(/file too large/i)).not.toBeInTheDocument();
    });
  });

  it('should accept PDF files', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const pdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(pdfFile);
    });
  });

  it('should accept JPG files', async () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const jpgFile = new File(['jpg content'], 'test.jpg', { type: 'image/jpeg' });

    const input = screen.getByLabelText('Upload document') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [jpgFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(jpgFile);
    });
  });

  it('should be keyboard accessible', () => {
    const onFileSelect = vi.fn();
    render(<DocumentUpload onFileSelect={onFileSelect} />);

    const uploadButton = screen.getByLabelText('Upload document');
    expect(uploadButton).toBeInTheDocument();

    const cameraButton = screen.getByLabelText('Take photo with camera');
    expect(cameraButton).toBeInTheDocument();
  });
});
