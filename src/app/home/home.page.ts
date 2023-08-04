import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import Konva from 'konva';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('stageContainer', { static: false }) stageContainer!: ElementRef;

  stage: Konva.Stage | undefined;
  layer: Konva.Layer | undefined;
  image: Konva.Image | undefined;
  imageObj: HTMLImageElement | undefined;

  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;

  files: NgxFileDropEntry[] = [];

  textToAdd: string = '';


  constructor() { }

  onFileDropped(event: any) {
    const files = event as FileList;
    if (files.length > 0) {
      // Faça o processamento e o upload das imagens aqui
      console.log('Imagem enviada:', files[0]);
      // Você pode chamar um serviço para enviar a imagem para o servidor
    }
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }

  ngAfterViewInit() {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: 700,
      height: 600,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result as string;
      this.loadImage(imageUrl);
    };

    reader.readAsDataURL(file);
  }

  loadImage(imageUrl: string) {
    this.imageObj = new Image();
    this.imageObj.src = imageUrl;

    this.imageObj.onload = () => {
      this.image = new Konva.Image({
        image: this.imageObj,
        width: this.stage?.width(),
        height: this.stage?.height(),
      });

      this.layer?.add(this.image);
      this.layer?.batchDraw();
    };
  }

  applyTextToImage() {
    if (this.textToAdd) {
      const text = new Konva.Text({
        text: this.textToAdd,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: 'black',
        x: 10,
        y: 10,
      });

      this.layer?.add(text);
      this.layer?.batchDraw();
    }
  }

}
