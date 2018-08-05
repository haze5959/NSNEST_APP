import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material';
import { HttpService } from '../service/http.service';
import { Router } from '@angular/router';

import {zip} from 'rxjs/observable/zip';
import { AppService } from '../service/appService';
import { CognitoUtil } from '../service/awsService/cognito.service';

@Component({
  selector: 'app-backCaution-board',
  templateUrl: './app.backCaution.board.html',
  styleUrls: ['./app.backCaution.board.css']
})
export class AppBackCautionBoard implements OnInit{
  
  pageSize = 0;
  pageLength = 0;
  boardPosts = [];
  orderBy = "id";
  orderBySeq = "desc";
  filterValue = "";

  constructor(private httpService: HttpService, public appService: AppService, private router: Router, private cognitoUtil: CognitoUtil) {}

  ngOnInit() {
    this.appService.engagingMainPage = 'backCautionBoard';
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          zip(
            parentClass.httpService.getPosts(accessToken, 40, parentClass.orderBy, parentClass.orderBySeq, 1), //해당 게시글 DB에서 빼온다
            parentClass.httpService.getPostSize(40)  //해당 게시글 숫자를 가져온다
          ).subscribe(
            data => {
              // console.log(JSON.stringify(data));
              parentClass.boardPosts = parentClass.appService.postFactory(data[0]);
              parentClass.pageLength = data[1][0];
              parentClass.pageSize = parentClass.boardPosts.length;
              parentClass.appService.isAppLoading = false;
            },
            error => {
              console.error("[error] - " + error.error.text);
              alert("[error] - " + error.error.text);
              parentClass.boardPosts.push(parentClass.httpService.errorPost);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    console.log(filterValue);
    this.appService.isAppLoading = true;
    
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          zip(
            parentClass.httpService.getPosts(accessToken, 40, parentClass.orderBy, parentClass.orderBySeq, 1, filterValue), //해당 게시글 DB에서 빼온다
            parentClass.httpService.getPostSize(40, filterValue)  //해당 게시글 숫자를 가져온다
          ).subscribe(
            data => {
              // console.log(JSON.stringify(data));
              parentClass.boardPosts = parentClass.appService.postFactory(data[0]);
              parentClass.pageLength = data[1][0];
              parentClass.pageSize = parentClass.boardPosts.length;
              parentClass.appService.isAppLoading = false;
              parentClass.filterValue = filterValue;
            },
            error => {
              console.error("[error] - " + error.error.text);
              alert("[error] - " + error.error.text);
              parentClass.boardPosts.push(parentClass.httpService.errorPost);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  pageEvent(pageEvent: PageEvent) {
    this.appService.isAppLoading = true;
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          parentClass.httpService.getPosts(accessToken, 40, parentClass.orderBy, parentClass.orderBySeq, pageEvent.pageIndex + 1)
          .subscribe(
            data => {
              // console.log(JSON.stringify(data));
              parentClass.boardPosts = parentClass.appService.postFactory(data);
              parentClass.appService.isAppLoading = false;
            },
            error => {
              console.error("[error] - " + error.error.text);
              alert("[error] - " + error.error.text);
              parentClass.boardPosts.push(parentClass.httpService.errorPost);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  pressOrderBy(orderByStr:string){
    if(this.orderBy == orderByStr){
      this.orderBySeq = this.orderBySeq == 'desc' ? 'asc' : 'desc';
    }else{
      this.orderBy = orderByStr;
      this.orderBySeq = 'desc';
    }

    this.applyFilter(this.filterValue);
  }

  pressPost(postId:number){
    this.router.navigate(['detail/' + postId]);
  }
}
