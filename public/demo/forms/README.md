# Demo Form Templates

This directory contains PDF form templates used in demo mode.

## Files

- `marion-appearance-template.pdf` - Marion County Appearance Form (to be added)

## Usage

These files are served directly from the public directory and do not require Firebase Storage.
They should be fillable PDF forms with named form fields matching the field IDs in the form JSON definitions.

## Getting Templates

1. Download blank forms from Marion County Superior Court website
2. Or create simple fillable PDFs using PDF editing software
3. Ensure field names match the `pdfFieldName` in form JSON definitions

## Demo Mode

In demo mode, the form filler will:
- Load templates from `/demo/forms/` instead of Firebase Storage
- Generate PDFs in-memory without uploading
- Store completed forms in browser memory (cleared on reload)
