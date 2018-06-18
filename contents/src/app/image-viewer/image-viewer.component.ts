import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
//사진첩 보여주는 컴포넌트
@Component({
  selector: 'image-viewer-dialog',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css']
})
export class ShowDetailImageDialog implements OnInit {

  imageUrl = this.data.imageUrl;
  constructor(public dialogRef: MatDialogRef<ShowDetailImageDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }
}

