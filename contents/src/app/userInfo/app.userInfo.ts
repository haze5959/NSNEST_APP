import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ShowDetailImageDialog } from '../image-viewer/image-viewer.component';
import { UserLoginService } from "../service/awsService/user-login.service";
import { CognitoCallback } from "../service/awsService/cognito.service";
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

import { AppService } from '../service/appService';
import { CognitoUtil } from '../service/awsService/cognito.service';
import { HttpService } from '../service/http.service';

@Component({
  selector: 'app-userInfo',
  templateUrl: './app.userInfo.html',
  styleUrls: ['./app.userInfo.css']
})
export class AppUserInfo implements CognitoCallback, OnInit {
  appName = this.appService.APP_NAME;
  appVersion = this.appService.APP_VERSION;
  appCopyrights = this.appService.APP_COPYRIGHTS;

  userId = new FormControl('', [Validators.required]);
  userPw = new FormControl('', [Validators.required]);
 
  constructor(public dialog: MatDialog, private userService: UserLoginService, private snackBar: MatSnackBar, public appService: AppService, private httpService: HttpService, private cookieService:CookieService) {}

  ngOnInit(){
    // this.appService.isAppLoading = true;
  }

  pressLogout(){
    //로그아웃 눌렀을 경우
    this.userService.logout();
    this.userPw.setValue("");
    this.appService.isAppLogin = false;
    this.snackBar.open("로그아웃 되었습니다.", "확인", {
      duration: 2000,
    });
  }

  pressLogin(){
    if(this.userId.valid && this.userPw.valid){
      this.appService.isAppLoading = true;
      this.userService.authenticate(this.userId.value, this.userPw.value, this);
    }
  }

  pressRegistration(){
    alert("회원가입 페이지로 이동합니다.");
    document.location.href = environment.registPage;
  }

  openSetUserInfoDialog(){
    const dialogRef = this.dialog.open(SetUserInfoDialog, {
      height: "90%",
      width: "80%",
      data: { 
        // profileText: this.appService.myInfo.intro,
        // profileDescription: this.appService.myInfo.description,
        // profileImage: this.appService.myInfo.image
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result){
        this.appService.isAppLoading = true;
        this.httpService.getUser(this.appService.myInfo.userId)
        .subscribe(
          data => {
            console.log(JSON.stringify(data));
            if(data.length > 0){
              this.appService.myInfo = this.appService.userFactory(data)[0]; //로그인 유저 매핑
              this.appService.isAppLogin = true;
            } else {
              console.error("[error] - error: 데이터 없음");
              alert("유저 정보를 가져오지 못하였습니다. ");
            }
            
            this.appService.isAppLoading = false;
          },
          error => {
            console.error("[error] - " + error.error.text);
            alert("유저 정보를 가져오지 못하였습니다. - " + error.error.text);
            this.appService.isAppLoading = false;
          }
        );
      }
    });
  }

  openProfileImage(){
    var image = new Image();
    image.src = this.appService.myInfo.image;
    image.onload = () => {
      let dialogRef = this.dialog.open(ShowDetailImageDialog, {
        height: image.height.toString(),
        width: image.width.toString(),
        maxHeight: '100vmin',
        data: { imageUrl: this.appService.myInfo.image }
      });

      dialogRef.afterClosed().subscribe(result => {});
    }
  }

  /**
   * AWS Delegate
   */
  cognitoCallback(message: string, result: any) {
    if (message != null) { //error
        console.log("result: " + message);
        if (message === 'User is not confirmed.') {
            this.snackBar.open("승인나지 않은 계정입니다.", "확인", {
              duration: 2000,
            });
        } else if (message === 'User needs to set password.') {
            //비밀번호 새로 설정. 지날 경우 없음
            this.snackBar.open("권오규한테 문의하시오.", "확인", {
              duration: 2000,
            });
        } else {  //아이디나 비밀번호 틀림
          this.snackBar.open("아이디나 비밀번호가 틀립니다.", "확인", {
            duration: 2000,
          });
        }

        this.appService.isAppLoading = false;
    } else { //로그인 성공
      // console.log("유저 정보 - " + JSON.stringify(result));
      const userPayload = result.idToken.payload;
      // userPayload.studentNum
      //유저 정보 설정custom:studentNum
      this.httpService.getUserWithConito(userPayload.sub, userPayload.name, userPayload['custom:studentNum'], userPayload.birthdate, userPayload.gender).subscribe(
        data => {
          console.log(JSON.stringify(data));
          if(data.length > 0){
            this.appService.myInfo = this.appService.userFactory(data)[0]; //로그인 유저 매핑
            this.appService.isAppLogin = true;
            this.appService.setCommentPushBtn();
            this.snackBar.open("로그인 성공", "확인", {
              duration: 2000,
            });

            // this.router.navigate(['newspeed/']);
            // location.reload();
            this.appService.refreshSubscriber.next(true);
          } else {
            console.error("[error] - error: 데이터 없음");
            alert("유저 정보를 가져오지 못하였습니다. ");
          }
          
          this.appService.isAppLoading = false;
        },
        error => {
          console.error("[error] - " + error.error.text);
          alert("유저 정보를 가져오지 못하였습니다. - " + error.error.text);
          this.appService.isAppLoading = false;
        }
      );
    }
  }

  pressCommentPush(e){
    alert(e.checked);
    if (e.checked == true) {
      this.appService.setCommentPush(true);
    } else {
      this.appService.setCommentPush(false);
    }
  }
}

/**
 * 유저 정보 편집 다이얼로그------------------------------------------------
 */
@Component({
  selector: 'dialog-setUserInfoDialog',
  templateUrl: 'dialog.setUserInfoDialog.html',
})
export class SetUserInfoDialog {
  profileText = new FormControl(this.appService.myInfo.intro);
  profileDescription = new FormControl(this.appService.myInfo.description);
  profileImage = this.appService.myInfo.image;
  constructor(
    public appService: AppService,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<ShowDetailImageDialog>){}
    // @Inject(MAT_DIALOG_DATA) public data: any, fb: FormBuilder) {}

    //이미지 변경
    changeImage(event: EventTarget): void {
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      let file: File = files[0];
      console.log(file);
      this.uploadImages(file);
    }

    //유저정보 수정 저장
    pressSaveBtn(): void {
      this.httpService.putUserInfo(this.appService.myInfo.userId, this.profileText.value, this.profileDescription.value, this.profileImage)
      .subscribe(
        data => {
          console.log(JSON.stringify(data));
          if(data.result){  //성공
            this.dialogRef.close(true);
          } else {  //실패
            throw new Error(data.message);
          }
        },
        error => {
          console.error("프로필 수정 실패 - " + error.message);
          alert("프로필 수정 실패 - " + error.message);
          this.appService.isAppLoading = false;
        }
      );
    }

    uploadImages(imageFile:File){
      this.appService.isAppLoading = true;
      this.httpService.uploadImage('profile', imageFile)
      .subscribe(
        data => {
          // console.log(JSON.stringify(data));
          if(data.result){  //성공
            const fileInfo = data.message.files.file;
            if(fileInfo && fileInfo.path){
              let filePath:string = fileInfo.path;
              filePath = filePath.replace('/1TB_Drive/NSNEST_PUBLIC/', '');
              const fileUrl = environment.fileUrl + filePath;
              console.log('이미지 업로드 완료 - ' + fileUrl);
              this.profileImage = fileUrl;

              this.appService.isAppLoading = false;
            } else {
              throw new Error('이미지 형식이 이상합니다.');
            }
          } else {  //실패
            console.error("앨범 업로드 실패 - " + data.message);
            alert("앨범 업로드 실패 - " + data.message);
            this.appService.isAppLoading = false;
          }
        },
        error => {
          console.error("앨범 업로드 실패 - " + error.message);
          alert("앨범 업로드 실패 - " + error.message);
          this.appService.isAppLoading = false;
        }
      );
    }
}