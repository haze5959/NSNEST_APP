import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpService } from '../service/http.service';
import { AppService } from '../service/appService';

@Component({
  selector: 'app-emoticonViewer',
  templateUrl: './app.emoticonViewer.html',
  styleUrls: ['./app.emoticonViewer.css']
})
export class AppEmoticonDialog implements OnInit {
  
  emoticonKeyList:string[] = [];
  selectEmoticonList:string[] = [];
  
  constructor(public dialogRef: MatDialogRef<AppEmoticonDialog>, private appService: AppService, private httpService: HttpService, private router: Router) {}
  
  ngOnInit() {
    this.httpService.getEmoticon('emoKey')
    .subscribe(
      data => {
        // console.log(JSON.stringify(data));
        if (data.length == 0) {
          alert("이모티콘 정보를 가져오지 못하였습니다.");
        } else {
          this.emoticonKeyList = data;
        }
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("이모티콘 정보를 가져오지 못하였습니다. - " + error.error.text);
      }
    );
  }

  getSelectEmoticon(emoKey:string){
    this.httpService.getEmoticon('emoticon', emoKey)
    .subscribe(
      data => {
        // console.log(JSON.stringify(data));
        if (data.length == 0) {
          alert("이모티콘 정보를 가져오지 못하였습니다.");
        } else {
          this.selectEmoticonList = data;
        }
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("이모티콘 정보를 가져오지 못하였습니다. - " + error.error.text);
      }
    );
  }

  tabChange($event:number){
    // console.log('OQ tabChange => ' + this.emoticonKeyList[$event]);
    this.getSelectEmoticon(this.emoticonKeyList[$event]);
  }

  pressEmoticon(index:number){
    this.dialogRef.close(this.selectEmoticonList[index]);
  }
}
