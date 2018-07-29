import { Component, OnInit } from '@angular/core';
import { HttpService } from '../service/http.service';
import { AppService } from '../service/appService';
import { Router } from '@angular/router';
import { posts } from '../model/posts';
import { PageEvent } from '@angular/material';
import { CognitoUtil } from '../service/awsService/cognito.service';

import {zip} from 'rxjs/observable/zip';

@Component({
  selector: 'app-elbum',
  templateUrl: './app.elbum.html',
  styleUrls: ['./app.elbum.css']
})
export class AppElbum implements OnInit{
  postImages: posts[] = [];
  pageSize = 0;
  pageLength = 0;

  constructor(private httpService: HttpService, public appService: AppService, private router: Router, private cognitoUtil: CognitoUtil) {}

  ngOnInit() {
    //뒤로가기
    document.addEventListener("backbutton", () => {
      let element: HTMLElement = document.getElementById('backBtn') as HTMLElement;
      element.click();
    }, false);

    this.appService.engagingMainPage = 'elbum';
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          zip(
            parentClass.httpService.getPosts(accessToken, 20, 'id', 'desc', 1), //해당 게시글 DB에서 빼온다
            parentClass.httpService.getPostSize(20)  //해당 게시글 숫자를 가져온다
          ).subscribe(
            data => {
              // console.log(JSON.stringify(data));
              parentClass.postImages = parentClass.appService.postFactory(data[0]);
              parentClass.pageLength = data[1][0];
              parentClass.pageSize = parentClass.postImages.length;
              parentClass.appService.isAppLoading = false;
            },
            error => {
              console.error("[error] - " + error.error.text);
              alert("[error] - " + error.error.text);
              parentClass.postImages.push(parentClass.httpService.errorPost);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  setPageEvent(pageEvent: PageEvent){
    this.appService.isAppLoading = true;
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          parentClass.httpService.getPosts(accessToken, 10, 'id', 'desc', pageEvent.pageIndex + 1)
          .subscribe(
            data => {
              // console.log(JSON.stringify(data));
              parentClass.postImages = parentClass.appService.postFactory(data);
              parentClass.appService.isAppLoading = false;
            },
            error => {
              console.error("[error] - " + error.error.text);
              alert("[error] - " + error.error.text);
              parentClass.postImages.push(parentClass.httpService.errorPost);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  pressOneImage(postId:number){
    this.router.navigate(['detail/' + postId]);
  }

  historyBack(){
    if(this.appService.engagingMainPage == 'newspeed'){
      this.router.navigate(['/']);
    } else if(this.appService.engagingMainPage == 'tastyLoad'){
      this.router.navigate(['/tastyLoad']);
    } else {
      this.router.navigate(['/']);
    }
  }
}