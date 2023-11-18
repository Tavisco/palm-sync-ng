import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-upload-prc',
  templateUrl: './upload-prc.component.html',
  styleUrls: ['./upload-prc.component.scss']
})
export class UploadPrcComponent {

  enableFileUpload = true; // Set this property based on your logic

  customUpload(event: any) {
    // Access the files from the event
    const files: File[] = event.files;

    // Log the size of each file
    files.forEach(file => {
      console.log(`File Name: ${file.name}, Size: ${this.formatBytes(file.size)}`);
    });
  }

  // Helper function to format bytes into human-readable sizes
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  onFileSelect(event: any) {
    // Handle file select event
    console.log('File selected:', event);
  }

  // uploadedFiles: any[] = [];

  // constructor(private messageService: MessageService) {}

  // onUpload(event:UploadEvent) {
  //     for(let file of event.files) {
  //         this.uploadedFiles.push(file);
  //     }

  //     this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  // }
}
