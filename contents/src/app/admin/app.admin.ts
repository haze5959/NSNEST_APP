import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from '../../environments/environment';
import { AppService } from '../service/appService';
import { HttpService } from '../service/http.service';
import { AppEmoticonDialog } from '../emoticonViewer/app.emoticonViewer';
import { CognitoUtil } from '../service/awsService/cognito.service';

@Component({
  selector: 'app-admin',
  templateUrl: './app.admin.html',
  styleUrls: ['./app.admin.css']
})
export class AppAdmin implements OnInit {

  @ViewChild('fileInput') fileInputEl:ElementRef;

  classify:string;

  constructor(private router: Router,private activeRoute: ActivatedRoute, private ElementRef:ElementRef, public dialog: MatDialog, private appService: AppService, public snackBar: MatSnackBar, private httpService: HttpService, private cognitoUtil: CognitoUtil) { 
    
  }

  emoFormControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    if(this.appService.myInfo && this.appService.myInfo.userId == 1060){
      //관리자 체크
    } else {
      alert('관리자 아님');
      this.router.navigate(['/']);
    }
  }

  uploadEmoticon($event){
    if(this.emoFormControl.valid){
      this.appService.isAppLoading = true;

      let parentClass = this;
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(token: any): void {
          parentClass.httpService.checkAccessToken(token).then((accessToken) => {
            parentClass.httpService.postEmoticon(accessToken, parentClass.emoFormControl.value, $event.target.files[0])
            .subscribe(
              data => {
                console.log(JSON.stringify(data));
                if(data.result){  //성공
                  parentClass.snackBar.open(`이미지 업로드 완료`, "확인");
                  parentClass.appService.isAppLoading = false;
            
                } else {  //실패
                  console.error("이미지 업로드 실패 - " + data.message);
                  alert("이미지 업로드 실패 - " + data.message);
                  parentClass.appService.isAppLoading = false;
                }
              },
              error => {
                console.error("이미지 업로드 실패 - " + error.message);
                alert(`이미지 업로드 실패 - ` + error.message);
                parentClass.appService.isAppLoading = false;
              }
            );
          });
        }
      });
  
    } else {
      this.snackBar.open('이모티콘 명 입력해라', "확인");
    }
  }
}
