
import { NgModule } from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser'; 
import { BrowserAnimationsModule } 
    from '@angular/platform-browser/animations'; 
  
import { AppComponent } from './app.component'; 
import { PanelMenuModule } from 'primeng/panelmenu'; 
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { UploadPrcComponent } from './upload-prc/upload-prc.component';
import { DownloadPrcComponent } from './download-prc/download-prc.component';
  
@NgModule({ 
imports: [BrowserModule, 
          BrowserAnimationsModule, 
          PanelMenuModule,
        ButtonModule,
        CardModule,
        TabViewModule,
        FileUploadModule,
        TableModule], 
declarations: [AppComponent, UploadPrcComponent, DownloadPrcComponent], 
bootstrap: [AppComponent] 
}) 
export class AppModule {}