import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('stageContainer', { static: false }) stageContainer!: ElementRef;

  stage: Konva.Stage | undefined;
  layer: Konva.Layer | undefined;
  image: Konva.Image | undefined;
  imageObj: HTMLImageElement | undefined;

  imageWidth: number = 0;
  imageHeight: number = 0;

  textToAdd: string = '';
  selectedText: Konva.Text | undefined;
  selectedFontSize: number = 25;
  selectedFontFamily: string = 'Arial';
  selectedTextColor: string = '#000000'; // Black color as defaul

  fontSize: number = 0;
  constructor() { }

  ngAfterViewInit() {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: this.stageContainer.nativeElement.clientWidth, // Define a largura do canvas
      height: this.stageContainer.nativeElement.clientHeight, // Define a altura do canvas
    });

    // Atualiza o tamanho do canvas quando o contêiner for redimensionado
    window.addEventListener('resize', () => {
      this.stage?.width(this.stageContainer.nativeElement.clientWidth);
      this.stage?.height(this.stageContainer.nativeElement.clientHeight);
      this.stage?.batchDraw();
    });


    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    // Adiciona um retângulo como background
    const backgroundRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.stage.width(),
      height: this.stage.height(),
      fill: 'lightgray', // Define a cor do background
    });

    this.layer.add(backgroundRect);
    this.layer.batchDraw();
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
        width: 500,
        height: 500,
        x: 300,
        y: 200,
        draggable: true,
      });

      const text = new Konva.Text({
        text: '',
        fontSize: 25,
        fontFamily: 'Arial',
        fill: 'black',
        x: 200,
        y: 200,
        draggable: true,
      });

      const imageAndTextGroup = new Konva.Group({
        draggable: true,
        dragBoundFunc: function (pos) {
          return {
            x: pos.x < 0 ? 0 : pos.x,
            y: pos.y < 0 ? 0 : pos.y,
          };
        },
      });

      imageAndTextGroup.add(this.image);
      imageAndTextGroup.add(text);
      this.layer?.add(imageAndTextGroup);
      this.layer?.batchDraw();
    };
  }

  applyTextToImage() {
    if (this.textToAdd) {
      const text = new Konva.Text({
        text: this.textToAdd,
        fontSize: this.selectedFontSize,
        fontFamily: this.selectedFontFamily,
        fill: this.selectedTextColor,
        x: 200,
        y: 200,
        draggable: true,
      });

      text.on('click', () => {
        this.selectText(text);
      });

      this.layer?.add(text);
      this.layer?.batchDraw();

      this.textToAdd = '';
    }
  }

  selectText = (text: Konva.Text) => {
    this.deselectText();
    this.selectedText = text;
    this.selectedFontSize = text.fontSize();
    this.selectedFontFamily = text.fontFamily();
    this.selectedTextColor = text.fill();
    this.layer?.batchDraw();
  }
  

  deselectText() {
    if (this.selectedText) {
      this.selectedText = undefined;
      this.layer?.batchDraw();
    }
  }

  editTextAttrs() {
    // Usando arrow function para preservar a referência correta ao 'this'
    const selectedText = this.selectedText;
    console.log('const selectedText', selectedText);
    
    if (selectedText) {
      // Verifica se o valor da fonte é um número positivo antes de aplicar as mudanças
      if (this.selectedFontSize && this.selectedFontSize > 0) {
        selectedText.fontSize(this.selectedFontSize);
      }
  
      // Verifica se o valor da cor é válido antes de aplicar as mudanças
      if (this.selectedTextColor && /^#[0-9A-F]{6}$/i.test(this.selectedTextColor)) {
        selectedText.fill(this.selectedTextColor);
      }
  
      // Aplica a mudança da família da fonte
      if (this.selectedFontFamily) {
        selectedText.fontFamily(this.selectedFontFamily);
      }
  
      this.layer?.batchDraw();
    }
  }
  
  
  

  resizeImage() {
    if (this.image && this.imageWidth && this.imageHeight) {
      const imageWidth = parseInt(this.imageWidth.toString());
      const imageHeight = parseInt(this.imageHeight.toString());

      const newWidth = Math.max(imageWidth, 1);
      const newHeight = Math.max(imageHeight, 1);

      const scaleX = newWidth / this.image.width();
      const scaleY = newHeight / this.image.height();

      this.image.scaleX(scaleX);
      this.image.scaleY(scaleY);
      this.layer?.batchDraw();
    }
  }
}
