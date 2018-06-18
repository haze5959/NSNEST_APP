import {
    Component,
    Input,
    Output,
    ContentChildren,
    HostListener,
    EventEmitter
  } from '@angular/core';
  
  import { Tab } from './Tab';
  
  @Component({
    selector: 'tabset',
    template: `
      <section class="tab-set">
        <ul
          class="nav"
          [class.nav-pills]="vertical"
          [class.nav-tabs]="!vertical">
          <li
            *ngFor="let tab of tabs"
            [class.active]="tab.active">
            <a
              (click)="tabClicked(tab)"
              class="btn"
              [class.disabled]="tab.disabled">
              <span>{{tab.title}}</span>
            </a>
          </li>
        </ul>
        <div class="tab-content">
          <ng-content></ng-content>
        </div>
      </section>
    `,
    styleUrls: ['./Tabset.css']
  })
  export class Tabset {
  
    @Input() vertical;
    @Output() onSelect = new EventEmitter();
    @ContentChildren(Tab) tabs;
  
    ngAfterContentInit() {
        setTimeout(() => {
            const tabs = this.tabs.toArray();
            const actives = this.tabs.filter(t => { return t.active });
        
            if(actives.length > 1) {
                console.error(`Multiple active tabs set 'active'`);
            } else if(!actives.length && tabs.length) {
                this.tabClicked(tabs[0]);
            }
        }, 100);
    }
  
    tabClicked(tab:Tab) {
      const tabs:Tab[] = this.tabs.toArray();
      tabs.forEach(tab => tab.active = false);
      tab.active = true;

      this.onSelect.emit(tab.index);
    }
  
  }
  
  export const TAB_COMPONENTS = [
    Tabset,
    Tab
  ];