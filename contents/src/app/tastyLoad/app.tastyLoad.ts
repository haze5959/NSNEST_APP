import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material';
import { HttpService } from '../service/http.service';
import { Router } from '@angular/router';

import { AppService } from '../service/appService';

import { posts } from '../model/posts';

@Component({
  selector: 'app-tasty-load',
  templateUrl: './app.tastyLoad.html',
  styleUrls: ['./app.tastyLoad.css']
})
export class AppTastyLoad {
  // initial center position for the map
  lat: number = 37.520000;
  lng: number = 127.000000; //용산구 좌표

  clickedMarker(label: string, index: number) {
    // console.log(`clicked the marker: ${label || index}`)
  }

  showDetailView(postID:number){
    this.router.navigate(['detail/' + postID]);
  }

  postMarkers: posts[] = [];

  constructor(public appService: AppService, private httpService: HttpService, private router: Router) {}
  pageSize = 0;
  pageLength = 0;
  orderBy = "id";
  orderBySeq = "desc";
  filterValue = "";
  
  ngOnInit() {
    this.appService.engagingMainPage = 'tastyLoad';
    this.httpService.getPostAll(30, this.orderBy, this.orderBySeq)
    .subscribe(
      data => {
        // console.log(JSON.stringify(data));
        this.postMarkers = this.appService.simplePostFactory(data);
        this.pageLength = this.postMarkers.length;
        this.pageSize = this.postMarkers.length;
        this.appService.isAppLoading = false;
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("[error] - " + error.error.text);
        this.postMarkers.push(this.httpService.errorPost);
        this.appService.isAppLoading = false;
      }
    );
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    // console.log(filterValue);
    this.appService.isAppLoading = true;
    this.httpService.getPostAll(30, this.orderBy, this.orderBySeq, filterValue)
    .subscribe(
      data => {
        // console.log(JSON.stringify(data));
        this.postMarkers = this.appService.simplePostFactory(data);
        this.pageLength = this.postMarkers.length;
        this.pageSize = this.postMarkers.length;
        this.appService.isAppLoading = false;
        this.filterValue = filterValue;
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("[error] - " + error.error.text);
        this.postMarkers.push(this.httpService.errorPost);
        this.appService.isAppLoading = false;
      }
    );
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

  pageEvent(pageEvent: PageEvent) {
    this.appService.isAppLoading = true;
    this.httpService.getPostAll(30, this.orderBy, this.orderBySeq, this.filterValue)
    .subscribe(
      data => {
        console.log(JSON.stringify(data));
        this.postMarkers = this.appService.simplePostFactory(data);
        this.appService.isAppLoading = false;
      },
      error => {
        console.error("[error] - " + error.error.text);
        alert("[error] - " + error.error.text);
        this.postMarkers.push(this.httpService.errorPost);
        this.appService.isAppLoading = false;
      }
    );
  }
}