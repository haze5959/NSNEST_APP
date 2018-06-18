import { Component, Input, Output, ElementRef, EventEmitter, HostListener } from '@angular/core';
import { posts } from '../model/posts';
import { Router } from '@angular/router';

import { AppService } from "../service/appService";
import { HttpService } from '../service/http.service';
import { CognitoUtil } from '../service/awsService/cognito.service';

@Component({
  selector: 'ptr-container',
  styles: [`
      :host {
          display: block;
          overflow: auto;
      }
  `],
  template: `
      <section [hidden]="!inProgress">
        <mat-progress-spinner
            style="margin:auto;"
            [color]="color"
            [mode]="mode">
        </mat-progress-spinner>
      </section>
      <ng-content></ng-content>
  `
})
export class PullToRefreshComponent {
  private lastScrollTop:number = 0;
  private isAtTop:boolean = false;
  private element:any;

  color = 'primary';
  mode = 'indeterminate';

  @Input('refresh') inProgress:boolean = false;
  @Output() onPull:EventEmitter<any> = new EventEmitter<any>();

  constructor(el:ElementRef) {
      this.element = el.nativeElement;
  }

  public get scrollTop() { return this.element.scrollTop || 0; }
  public set scrollTop(value:number) { this.element.scrollTop = value; }

  @HostListener('scroll')
  @HostListener('touchmove')
  onScroll() {
      if(this.scrollTop <= 0 && this.lastScrollTop <= 0) {
          if(this.isAtTop){
            this.onPull.emit(true);
            this.isAtTop = false;
          } else {
            setTimeout(() => {
              this.isAtTop = true;
            }, 2000);
          }
      }
      this.lastScrollTop = this.scrollTop;
  }

}