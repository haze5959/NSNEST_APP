import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { UserLoginService } from "../service/awsService/user-login.service";
import { CognitoCallback } from "../service/awsService/cognito.service";

import { AppService } from "../service/appService";
import { HttpService } from '../service/http.service';
import { CognitoUtil } from '../service/awsService/cognito.service';
import { PullToRefreshComponent } from './pullToRefresh';
import { Observable } from 'rxjs/Observable';

declare var cordova;

@Component({
  selector: 'app-newspeed',
  templateUrl: './app.newspeed.html',
  styleUrls: ['./app.newspeed.css']
})
export class AppNewspeed implements OnInit, OnDestroy, CognitoCallback {

  isInProgress:boolean = false;
  userId = new FormControl('', [Validators.required]);
  userPw = new FormControl('', [Validators.required]);

  fairyText = "어서와.";
  loginFailCount = 0;

  onPull() {
    if(!this.isInProgress){
      this.isInProgress = true;
      setTimeout(() => {
        this.initPosts(); 
      }, 500);
    }
  }
  constructor(private router: Router, private httpService: HttpService, public appService: AppService, private cognitoUtil: CognitoUtil, private userService: UserLoginService, private snackBar: MatSnackBar) {}
  @ViewChild('newspeedScroll') public newspeedScroll:PullToRefreshComponent;

  ngOnInit(){
    this.fairyText = "어서와.";
    this.loginFailCount = 0;
    this.appService.engagingMainPage = 'newspeed';
    if(this.appService.isAppLogin){
      if (this.appService.newspeedPosts.length == 0) {
        this.initPosts(); 
      } else {
        setTimeout(() => {
          this.newspeedScroll.scrollTop = this.appService.newspeedScrollY;
        }, 100);
      }
    } else {
      new Observable(observer => {
        this.appService.refreshSubscriberArr.push(observer);
      }).subscribe(
        value => {
          this.initPosts();
        }
      );
    }
  }

  ngOnDestroy(){
    this.appService.newspeedScrollY = this.newspeedScroll.scrollTop;
  }

  public initPosts(){
    if(this.cognitoUtil.getCurrentUser()){
      this.appService.newspeedPageIndex = 1;
      this.appService.isAppLoading = true;
      this.httpService.getPosts(0, "date", "desc", this.appService.newspeedPageIndex) //해당 게시글 DB에서 빼온다
      .subscribe(
        data => {
          this.appService.newspeedPosts = this.appService.postSafeHtmlFactory(data);
          // console.log(JSON.stringify(this.recentPosts));
          this.isInProgress = false;
          setTimeout(() => {
            this.appService.isAppLoading = false;
            this.newspeedScroll.scrollTop = 10;
          }, 200);
          
        },
        error => {
          console.error("[error] - " + error.error.text);
          alert("[error] - " + error.error.text);
          this.appService.newspeedPosts.push(this.httpService.errorPost);
          this.appService.isAppLoading = false;
          this.isInProgress = false;
        }
      );
    } else {
      this.appService.isAppLoading = false;
      this.appService.isAppLogin = false;
      this.isInProgress = false;
      console.log("로그인 된 유저 없습니다.");
    }
  }

  pressPosts(postsID){
    this.router.navigate(['detail/' + postsID]);
  }

  /**
   * 무한 스크롤
   */
  onScroll () {
    this.appService.isAppLoading = true;
    this.httpService.getPosts(0, "date", "desc", this.appService.newspeedPageIndex + 1) //해당 게시글 DB에서 빼온다
    .subscribe(
      data => {
        // console.log(JSON.stringify(data));
        if(data.length == 0){ //데이터가 더이상 없을 경우
          alert("마지막 게시글 입니다.");
        } else {
          this.appService.newspeedPosts = this.appService.newspeedPosts.concat(this.appService.postSafeHtmlFactory(data));
          this.appService.newspeedPageIndex++;
        }
        
        this.appService.isAppLoading = false;
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("[error] - " + error.error.text);
        this.appService.newspeedPosts.push(this.httpService.errorPost);
        this.appService.isAppLoading = false;
      }
    );
  }


  /**
   * 로그인 관련
   */
  pressRegistration(){
    cordova.InAppBrowser.open('http://apache.org', '_blank', 'location=yes');
    // document.location.href = environment.registPage;
  }

  pressLogin(){
    if(this.userId.valid && this.userPw.valid){
      this.appService.isAppLoading = true;
      this.userService.authenticate(this.userId.value, this.userPw.value, this);
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

        console.log(this.loginFailCount);
        if(this.loginFailCount > 0){
          this.fairyText = "회원가입부터 하는게 어때? 애송이";
        } else {
          this.fairyText = "틀렸어, 앞으로 한번만 더 기회를 줄게";
        }
        
        this.appService.isAppLoading = false;
        this.loginFailCount++;
    } else { //로그인 성공
      this.loginFailCount = 0
      this.fairyText = "어서와.";
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
            this.snackBar.open("로그인 성공", "확인", {
              duration: 2000,
            });

            // this.router.navigate(['newspeed/']);
            // location.reload();
            this.appService.refreshSubscriberArr.forEach(obs => {
              obs.next(true);
            });
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
}
