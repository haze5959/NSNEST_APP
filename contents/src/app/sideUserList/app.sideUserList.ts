import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpService } from '../service/http.service';
import { AppService } from '../service/appService';
import { user } from '../model/user';
import { posts } from '../model/posts';
import { schedule } from '../model/schedule';

@Component({
  selector: 'app-sideUserList',
  templateUrl: './app.sideUserList.html',
  styleUrls: ['./app.sideUserList.css']
})
export class AppSideUserList implements OnInit {
  
  userOrderByLank: user[] = [];
  recentUsers: user[] = [];
  allUsers: user[] = [];
  
  constructor(public dialog: MatDialog, private appService: AppService, private httpService: HttpService, private router: Router) {}
  
  ngOnInit() {
    if(this.appService.isAppLogin){
      this.tabChange(0);
    } else {
      this.tabChange(0);
    }
  }

  pressOneUser(user:user){
    const dialogRef = this.dialog.open(ShowUserInfoDialog, {
      height: this.appService.isPhone?"95%":"80%",
      width: this.appService.isPhone?"95%":"50%",
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

  pressOneSchedule(scheduleId:number){
    this.router.navigate(['detail/' + scheduleId]);
  }

  tabChange(event:number){
    switch (event) {
      case 0: //recent==================================================
        this.httpService.getUsers('update', 10)
        .subscribe(
          data => {
            // console.log(JSON.stringify(data));
            if (data.length == 0) {
              alert("유저 정보를 가져오지 못하였습니다.");
            } else {
              this.recentUsers = this.appService.userFactory(data)
            }
          },
          error => {
            console.error("[error] - " + error.error.text);
            alert("유저 정보를 가져오지 못하였습니다. - " + error.error.text);
          }
        );
        break;

      case 1: //rank==================================================
        this.httpService.getUsers('rank', 10)
        .subscribe(
          data => {
            // console.log(JSON.stringify(data));
            if (data.length == 0) {
              alert("유저 정보를 가져오지 못하였습니다.");
            } else {
              this.userOrderByLank = this.appService.userFactory(data)
            }
          },
          error => {
            console.error("[error] - " + error.error.text);
            alert("유저 정보를 가져오지 못하였습니다. - " + error.error.text);
          }
        );
        break;

        case 2: //schedule==================================================
        this.httpService.getUsers('update', 100)
        .subscribe(
          data => {
            console.log(JSON.stringify(data));
            if (data.length == 0) {
              alert("스케쥴 정보를 가져오지 못하였습니다.");
            } else {
              this.allUsers = this.appService.userFactory(data)              
            }
          },
          error => {
            console.error("[error] - " + error.error.text);
            alert("스케쥴 정보를 가져오지 못하였습니다. - " + error.error.text);
          }
        );
        break;
    
      default:
        break;
    }
  }
}

/**
 * 유저 정보 보기 다이얼로그------------------------------------------------
 */
@Component({
  selector: 'dialog-showUserInfoDialog',
  templateUrl: 'dialog.showUserInfoDialog.html',
})
export class ShowUserInfoDialog {
  user = this.data;
  constructor(
    private appService: AppService,
    public dialogRef: MatDialogRef<ShowUserInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: user) {}
}
