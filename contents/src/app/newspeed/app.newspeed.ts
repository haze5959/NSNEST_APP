import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from "../service/appService";
import { HttpService } from '../service/http.service';
import { CognitoUtil } from '../service/awsService/cognito.service';
import { PullToRefreshComponent } from './pullToRefresh';

@Component({
  selector: 'app-newspeed',
  templateUrl: './app.newspeed.html',
  styleUrls: ['./app.newspeed.css']
})
export class AppNewspeed implements OnInit, OnDestroy {

  isInProgress:boolean = false;

  onPull() {
    if(!this.isInProgress){
      this.isInProgress = true;
      setTimeout(() => {
        this.initPosts(); 
      }, 500);
    }
  }
  constructor(private router: Router, private httpService: HttpService, public appService: AppService, private cognitoUtil: CognitoUtil) {}
  @ViewChild('newspeedScroll') public newspeedScroll:PullToRefreshComponent;

  ngOnInit(){
    if(this.appService.isAppLogin){
      if (this.appService.newspeedPosts.length == 0) {
        this.initPosts(); 
      } else {
        setTimeout(() => {
          this.newspeedScroll.scrollTop = this.appService.newspeedScrollY;
        }, 100);
      }
    } else {
      this.appService.refreshObserber.subscribe(
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
}
