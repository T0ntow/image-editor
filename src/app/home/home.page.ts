import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
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

  textToAdd: string = '';
  selectedText: Konva.Text | undefined;
  selectedFontSize: number = 25;
  selectedFontFamily: string = 'Arial';
  selectedTextColor: string = '#000000'; // Black color as defaul
  fontSize: number = 0;

  //shape
  selectedShape: Konva.Shape | undefined;
  selectedShapeFill: string = '#000000';
  selectedShapeStroke: string = '#000000';

  //image
  selectedImage: Konva.Image | undefined;
  imageWidth: number = 0;
  imageHeight: number = 0;

  //pen
  isPenActive: boolean = false;
  strokeWidth: number = 5;
  selectedPen: Konva.Line | undefined;
  selectedPenStroke: string = '#000000';

  // public colorShapeStroke = 'rgba(48, 48, 48, 1)'

  constructor() { }

  ngAfterViewInit() {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: this.stageContainer.nativeElement.clientWidth, // Define a largura do canvas
      height: this.stageContainer.nativeElement.clientHeight, // Define a altura do canvas
    });

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
        resizeEnabled: true,
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
    if (text) {
      this.unselectedText();
      this.unselectShape();
      this.deactivatePenTool();

      this.selectedText = text;
      this.selectedFontSize = text.fontSize();
      this.selectedFontFamily = text.fontFamily();
      this.selectedTextColor = text.fill();
      this.layer?.batchDraw();
    }
  }

  unselectedText() {
    if (this.selectedText) {
      this.selectedText = undefined;
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

  editAttrs() {
    const selectedText = this.selectedText;
    const selectedShape = this.selectedShape;
    const selectedPen = this.selectedPen;

    if (selectedText) {
      console.log("selectedText");
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
    } else if (selectedShape) {
      // Verifica se o valor da cor é válido antes de aplicar as mudanças
      if (this.selectedShapeFill && /^#[0-9A-F]{6}$/i.test(this.selectedShapeFill)) {
        selectedShape.fill(this.selectedShapeFill);
      }

      selectedShape.stroke(this.selectedShapeStroke);

      this.layer?.batchDraw();
    } else if(this.isPenActive) {
      selectedPen?.strokeWidth(this.strokeWidth);
      selectedPen?.fill(this.selectedPenStroke);
      this.layer?.batchDraw();

    }
  }

  addSquare() {
    const square = new Konva.Rect({
      width: 100,
      height: 100,
      fill: this.selectedShapeFill,
      stroke: 'black', // Cor da borda
      strokeWidth: 2,  // Largura da borda
      x: 150,
      y: 150,
      draggable: true,
    });

    square.on('click', () => {
      this.selectShape(square);
    });

    this.layer?.add(square);
    this.layer?.batchDraw();
  }


  addCircle() {
    const circle = new Konva.Circle({
      radius: 50,
      stroke: 'black', // Cor da borda
      strokeWidth: 2,  // Largura da borda
      x: 150,
      y: 150,
      draggable: true,
    });

    circle.on('click', () => {
      this.selectShape(circle);
    });

    this.layer?.add(circle);
    this.layer?.batchDraw();
  }

  addArrow() {
    const arrow = new Konva.Arrow({
      points: [0, 0, 100, 0],
      pointerLength: 20,
      pointerWidth: 20,
      stroke: 'black',
      strokeWidth: 2,
      x: 250,
      y: 250,
      draggable: true,
      resizeEnabled: true,
    });

    arrow.on('click', () => {
      this.selectShape(arrow);
    });

    this.layer?.add(arrow);
    this.layer?.batchDraw();
  }

  selectShape(shape: Konva.Shape) {
    if (shape) {
      this.unselectShape();
      this.unselectedText();
      this.deactivatePenTool();

      this.selectedShape = shape;

      const transformer = new Konva.Transformer({
        nodes: [shape],
        name: 'transformer' // Define o nome do transformer
      });

      this.layer?.add(transformer);
      this.layer?.batchDraw();
    }
  }

  removeFill() {
    const selectedShape = this.selectedShape;

    if(selectedShape) {
      selectedShape.fill('transparent')
      this.layer?.batchDraw();
    }
  }

  removeEdge() {
    const selectedShape = this.selectedShape;

    if(selectedShape) {
      selectedShape.stroke('transparent')
      selectedShape.strokeWidth(0);        
      this.layer?.batchDraw();

    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    // Verifica se a tecla pressionada foi "Esc"
    if (event.key === 'Escape') {
      this.unselectShape();
    }
  }

  unselectShape() {
    this.unselectedText();

    if (this.selectedShape) {
      this.selectedShape = undefined;
      const transformer = this.layer?.findOne('.transformer'); // Encontra o transformer pelo nome
      if (transformer) {
        transformer.destroy(); // Remove o transformer
      }

      this.layer?.batchDraw(); // Atualiza o canvas
    }
  }

  activatePenTool() {
    let isDrawing = false;
    // let lastLine: Konva.Line | undefined;
    let points: number[] = [];

    this.unselectShape();
    this.unselectedText();

    this.isPenActive = true;


    this.stage?.on('mousedown touchstart', (e) => {
      isDrawing = true;
      points = [e.evt.layerX, e.evt.layerY];

      this.selectedPen = new Konva.Line({
        stroke: this.selectedPenStroke, // Cor do desenho
        strokeWidth: this.strokeWidth, // Largura do pincel
        lineCap: 'round',
        lineJoin: 'round',
        points: [...points], // Cria uma cópia dos pontos
      });

      this.layer?.add(this.selectedPen);
    });

    this.stage?.on('mousemove touchmove', (e) => {
      if (!isDrawing || !this.selectedPen) {
        return;
      }
      const newPoints = this.selectedPen.points().concat([e.evt.layerX, e.evt.layerY]);
      this.selectedPen.points(newPoints);
      this.layer?.batchDraw();
    });

    this.stage?.on('mouseup touchend', () => {
      isDrawing = false;
      points = [];
      this.selectedPen = undefined; // Limpa a última linha
    });
  }

  deactivatePenTool() {
    this.isPenActive = false;
    this.stage?.off('mousedown touchstart');
    this.stage?.off('mousemove touchmove');
    this.stage?.off('mouseup touchend');
  }

}
